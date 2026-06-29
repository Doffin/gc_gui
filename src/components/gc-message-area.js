class GCMessageArea extends HTMLElement {
  constructor() {
    super();
    this.maxEntries = Number.parseInt(this.getAttribute("max-entries") || "100", 10);
    this.entries = [];
    this.bufferedEntries = [];
    this.isFrozen = false;
    this.activeLevels = new Set(["debug", "info", "warn", "error"]);
    this.filtersLoaded = false;
    this.onLogEvent = this.onLogEvent.bind(this);

    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .panel {
          border: 1px solid #cbd5e1;
          border-radius: 0.5rem;
          background: #f8fafc;
          overflow: hidden;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0.75rem;
          border-bottom: 1px solid #dbe5f0;
          background: #edf2f7;
        }

        .title {
          margin: 0;
          font-size: 0.9rem;
          font-weight: 700;
          color: #1f2937;
        }

        .tools {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .filters {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .filter-btn {
          border: 1px solid #cbd5e1;
          border-radius: 999px;
          background: white;
          color: #334155;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          padding: 0.12rem 0.45rem;
          cursor: pointer;
        }

        .filter-btn[data-active="false"] {
          opacity: 0.45;
        }

        .counter {
          font-size: 0.75rem;
          color: #64748b;
        }

        .clear-btn {
          border: 1px solid #cbd5e1;
          border-radius: 0.35rem;
          background: white;
          color: #334155;
          font-size: 0.75rem;
          padding: 0.2rem 0.45rem;
          cursor: pointer;
        }

        .freeze-btn[data-frozen="true"] {
          border-color: #2563eb;
          background: #dbeafe;
          color: #1e3a8a;
        }

        .log-list {
          margin: 0;
          padding: 0;
          list-style: none;
          max-height: 12rem;
          overflow: auto;
          background: #0f172a;
          color: #e2e8f0;
          font-family: Consolas, "Courier New", monospace;
          font-size: 0.74rem;
          line-height: 1.35;
        }

        .entry {
          display: grid;
          grid-template-columns: auto auto 1fr;
          gap: 0.5rem;
          padding: 0.35rem 0.65rem;
          border-bottom: 1px solid rgba(148, 163, 184, 0.15);
        }

        .time {
          color: #94a3b8;
        }

        .level {
          min-width: 3.6rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .level.debug {
          color: #93c5fd;
        }

        .level.info {
          color: #86efac;
        }

        .level.warn {
          color: #fcd34d;
        }

        .level.error {
          color: #fca5a5;
        }

        .message {
          white-space: pre-wrap;
          word-break: break-word;
        }
      </style>

      <section class="panel">
        <div class="header">
          <h2 class="title">Messages</h2>
          <div class="tools">
            <div class="filters" role="group" aria-label="Log level filters">
              <button class="filter-btn" data-level="debug" data-active="true" type="button">Debug</button>
              <button class="filter-btn" data-level="info" data-active="true" type="button">Info</button>
              <button class="filter-btn" data-level="warn" data-active="true" type="button">Warn</button>
              <button class="filter-btn" data-level="error" data-active="true" type="button">Error</button>
            </div>
            <span id="counter" class="counter">0</span>
            <button id="freezeButton" class="clear-btn freeze-btn" data-frozen="false" type="button">Freeze</button>
            <button id="clearButton" class="clear-btn" type="button">Clear</button>
          </div>
        </div>
        <ul id="logList" class="log-list" aria-live="polite"></ul>
      </section>
    `;

    this.logListEl = root.getElementById("logList");
    this.counterEl = root.getElementById("counter");
    this.clearButtonEl = root.getElementById("clearButton");
    this.freezeButtonEl = root.getElementById("freezeButton");
    this.filterButtons = Array.from(root.querySelectorAll(".filter-btn"));

    this.clearButtonEl.addEventListener("click", () => {
      this.entries = [];
      this.bufferedEntries = [];
      this.render();
    });

    this.freezeButtonEl.addEventListener("click", () => {
      this.isFrozen = !this.isFrozen;
      if (!this.isFrozen && this.bufferedEntries.length > 0) {
        this.entries.push(...this.bufferedEntries);
        this.bufferedEntries = [];
        this.trimToMaxEntries();
      }
      this.render();
    });

    this.filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const level = button.dataset.level;
        if (!level) {
          return;
        }

        if (this.activeLevels.has(level)) {
          this.activeLevels.delete(level);
        } else {
          this.activeLevels.add(level);
        }

        this.saveFilterState();
        this.render();
      });
    });
  }

  connectedCallback() {
    document.addEventListener("app-log", this.onLogEvent);
    this.loadFilterState();
    this.render();
  }

  disconnectedCallback() {
    document.removeEventListener("app-log", this.onLogEvent);
  }

  onLogEvent(event) {
    const detail = event.detail || {};
    const entry = {
      time: new Date().toLocaleTimeString(),
      level: detail.level || "info",
      source: detail.source || "app",
      message: detail.message || "(no message)",
    };

    if (this.isFrozen) {
      this.bufferedEntries.push(entry);
      this.updateHeaderState();
      return;
    }

    this.entries.push(entry);
    this.trimToMaxEntries();
    this.render();
  }

  trimToMaxEntries() {
    if (this.entries.length > this.maxEntries) {
      this.entries.splice(0, this.entries.length - this.maxEntries);
    }
  }

  getFilterStorageKey() {
    const scope = this.id || this.getAttribute("name") || "default";
    return `gc.messageArea.filters.${scope}`;
  }

  loadFilterState() {
    if (this.filtersLoaded) {
      return;
    }

    this.filtersLoaded = true;
    try {
      const raw = localStorage.getItem(this.getFilterStorageKey());
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return;
      }

      const allowed = new Set(["debug", "info", "warn", "error"]);
      this.activeLevels = new Set(parsed.filter((level) => allowed.has(String(level).toLowerCase())).map((level) => String(level).toLowerCase()));
    } catch {
      // ignore broken localStorage values
    }
  }

  saveFilterState() {
    try {
      localStorage.setItem(this.getFilterStorageKey(), JSON.stringify(Array.from(this.activeLevels)));
    } catch {
      // ignore storage quota/private mode errors
    }
  }

  render() {
    const filteredEntries = this.entries.filter((entry) => this.activeLevels.has(String(entry.level).toLowerCase()));
    this.updateHeaderState(filteredEntries.length);

    this.filterButtons.forEach((button) => {
      const level = button.dataset.level;
      const isActive = this.activeLevels.has(String(level));
      button.dataset.active = isActive ? "true" : "false";
    });

    this.logListEl.innerHTML = filteredEntries
      .map((entry) => {
        const levelClass = String(entry.level).toLowerCase();
        const safeLevel = this.escapeHtml(String(entry.level).toUpperCase());
        const safeTime = this.escapeHtml(entry.time);
        const safeMessage = this.escapeHtml(`[${entry.source}] ${entry.message}`);

        return `
          <li class="entry">
            <span class="time">${safeTime}</span>
            <span class="level ${levelClass}">${safeLevel}</span>
            <span class="message">${safeMessage}</span>
          </li>
        `;
      })
      .join("");

    this.logListEl.scrollTop = this.logListEl.scrollHeight;
  }

  updateHeaderState(filteredCount = null) {
    const visibleCount = filteredCount ?? this.entries.filter((entry) => this.activeLevels.has(String(entry.level).toLowerCase())).length;
    const bufferedCount = this.bufferedEntries.length;
    this.counterEl.textContent = bufferedCount > 0 ? `${visibleCount}/${this.entries.length} +${bufferedCount}` : `${visibleCount}/${this.entries.length}`;

    this.freezeButtonEl.dataset.frozen = this.isFrozen ? "true" : "false";
    this.freezeButtonEl.textContent = this.isFrozen ? "Frozen" : "Freeze";
    this.freezeButtonEl.title = this.isFrozen ? "Resume and append buffered messages" : "Pause incoming messages in the list";
  }

  escapeHtml(value) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }
}

customElements.define("gc-message-area", GCMessageArea);
