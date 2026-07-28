import w3_css from "./w3.css?inline";
import { loadLanguageCatalog, normalizeLanguageCode } from "./locale/locale-loader.js";
import { GCDataLink } from "./gc-datalink.js";
import { GcBleLink } from "./gc-blelink.js";

class GCLinkHost extends HTMLElement {
    static get observedAttributes() {
        return ["title", "counter", "autoconnect", "autoconnect-interval-ms", "transport", "ble-service-uuid"];
    }

    constructor() {
        super();
        this.defaultAutoConnectRequested = false;
        this.currentLanguageCode = null;
        this.counter = 0;

        this.onOpenPortClick = this.onOpenPortClick.bind(this);
        this.onLanguageChange = this.onLanguageChange.bind(this);
        this.onDataLinkLog = this.onDataLinkLog.bind(this);
        this.onDataLinkStatus = this.onDataLinkStatus.bind(this);
        this.onDataLinkLine = this.onDataLinkLine.bind(this);

        const root = this.attachShadow({ mode: "open" });
        root.innerHTML = this.getTemplateHtml();

        this.titleEl = root.getElementById("openPortButton");
        this.buttonLabelEl = root.getElementById("buttonLabel");
        this.autoIndicatorEl = root.getElementById("autoIndicator");
        this.messageEl = root.getElementById("message");
        this.statusLEDEl = root.getElementById("statusLED");

        this.dataLink = this.createDataLink();
        this.attachDataLinkHooks();
    }

    getTransport() {
        const value = String(this.getAttribute("transport") || "serial").trim().toLowerCase();
        return value === "ble" ? "ble" : "serial";
    }

    getBleServiceUuid() {
        return this.getAttribute("ble-service-uuid") || "00005500-d102-11e1-9b23-00025b00a5a5";
    }

    getDataLinkConfig() {
        const transport = this.getTransport();
        const shared = {
            componentIdentifier: this.id || this.tagName.toLowerCase(),
        };

        if (transport === "ble") {
            return {
                ...shared,
                serviceUuid: this.getBleServiceUuid(),
            };
        }

        return {
            ...shared,
            autoconnect: this.isAutoConnectRequested(),
            autoconnectIntervalMs: this.getAutoConnectIntervalMs(),
            storageScope: `${this.tagName.toLowerCase()}:${this.id || this.getAttribute("title") || "default"}`,
        };
    }

    createDataLink() {
        if (this.getTransport() === "ble") {
            return new GcBleLink(this.getDataLinkConfig());
        }

        return new GCDataLink(this.getDataLinkConfig());
    }

    attachDataLinkHooks() {
        this.dataLink.onPortConnected = async () => {
            await this.onPortConnected();
            this.render();
        };
        this.dataLink.onPortDisconnected = async () => {
            await this.onPortDisconnected();
            this.render();
        };
    }

    configureDataLinkFromAttributes() {
        if (typeof this.dataLink?.configure === "function") {
            this.dataLink.configure(this.getDataLinkConfig());
        }
    }

    async replaceDataLinkIfNeeded(force = false) {
        const expectedTransport = this.getTransport();
        const currentTransport = this.dataLink?.getPortStatus?.().transport || "serial";
        if (!force && expectedTransport === currentTransport) {
            this.configureDataLinkFromAttributes();
            return;
        }

        const previousLink = this.dataLink;
        if (previousLink) {
            previousLink.removeEventListener("app-log", this.onDataLinkLog);
            previousLink.removeEventListener("port-status-change", this.onDataLinkStatus);
            previousLink.removeEventListener("serial-line", this.onDataLinkLine);
            previousLink.stopMonitoring?.();
            await previousLink.disconnectPort({ intentional: true });
        }

        this.dataLink = this.createDataLink();
        this.attachDataLinkHooks();

        if (this.isConnected) {
            this.dataLink.addEventListener("app-log", this.onDataLinkLog);
            this.dataLink.addEventListener("port-status-change", this.onDataLinkStatus);
            this.dataLink.addEventListener("serial-line", this.onDataLinkLine);
            this.dataLink.startMonitoring?.();
        }

        this.render();
    }

    getExtraStyles() {
        return "";
    }

    processIncomingLine(_textLine) {
        return false;
    }

    getStatusState() {
        return this.port ? "green" : "red";
    }

    getStatusLabel() {
        return this.port ? "Connected" : "Disconnected";
    }

    getButtonLabelText() {
        return this.getAttribute("title") || "Serial Port";
    }

    getExtraMarkup() {
        return "";
    }

    getTitleButtonWidth() {
        return "10rem";
    }

    async onPortConnected() {}

    async onPortDisconnected() {}

    afterRender() {}

    getLocaleComponentKey() {
        return this.constructor.name;
    }

    getLocaleElementMap() {
        return {};
    }

    getDefaultLanguageCode() {
        const htmlLang = document.documentElement?.lang || "";
        return String(htmlLang).trim().slice(0, 2).toLowerCase() || "en";
    }

    normalizeLanguageCode(value) {
        return normalizeLanguageCode(value);
    }

    isAutoConnectRequested() {
        const value = this.getAttribute("autoconnect");
        if (value == null) {
            return this.defaultAutoConnectRequested;
        }

        return value !== "false";
    }

    getAutoConnectIntervalMs() {
        const value = Number.parseInt(this.getAttribute("autoconnect-interval-ms") || "5000", 10);
        return Number.isFinite(value) && value >= 1000 ? value : 5000;
    }

    get port() {
        if (this.dataLink?.port) {
            return this.dataLink.port;
        }

        return this.dataLink?.isConnected?.() ? this.dataLink : null;
    }

    emitAppLog(level, message, meta = {}) {
        this.dispatchEvent(
            new CustomEvent("app-log", {
                detail: {
                    level,
                    source: this.id || this.tagName.toLowerCase(),
                    message,
                    ...meta,
                },
                bubbles: true,
                composed: true,
            }),
        );
    }

    async onLanguageChange(event) {
        const detail = event?.detail;
        const requestedCode = typeof detail === "string" ? detail : detail?.code;
        await this.applyLanguage(requestedCode);
    }

    async loadLocaleCatalog(code) {
        const normalizedCode = this.normalizeLanguageCode(code);
        if (!normalizedCode) {
            return null;
        }

        try {
            return await loadLanguageCatalog(normalizedCode);
        } catch (error) {
            this.emitAppLog("warn", `Could not load locale '${normalizedCode}'`);
            console.warn("Failed to load locale catalog:", normalizedCode, error);
            return null;
        }
    }

    applyComponentLocale(componentCatalog) {
        if (!this.shadowRoot || !componentCatalog || typeof componentCatalog !== "object") {
            return;
        }

        const elementMap = this.getLocaleElementMap() || {};

        for (const [propertyName, config] of Object.entries(componentCatalog)) {
            if (!config || typeof config !== "object") {
                continue;
            }

            const mapped = elementMap[propertyName] || {};
            const labelId = config.elementId || mapped.labelId || `${propertyName}Label`;
            const unitId = config.unitElementId || mapped.unitId || `${propertyName}Unit`;
            const tooltipId = config.tooltipElementId || mapped.tooltipId || labelId;

            if (typeof config.label === "string" && labelId) {
                const labelEl = this.shadowRoot.getElementById(labelId);
                if (labelEl) {
                    labelEl.textContent = config.label;
                }
            }

            if (typeof config.unit === "string" && unitId) {
                const unitEl = this.shadowRoot.getElementById(unitId);
                if (unitEl) {
                    unitEl.textContent = config.unit;
                }
            }

            if (typeof config.tooltip === "string" && tooltipId) {
                const tooltipEl = this.shadowRoot.getElementById(tooltipId);
                if (tooltipEl) {
                    tooltipEl.title = config.tooltip;
                    tooltipEl.setAttribute("aria-label", config.tooltip);
                }
            }
        }
    }

    async applyLanguage(code) {
        const normalizedCode = this.normalizeLanguageCode(code || this.getDefaultLanguageCode());
        if (!normalizedCode || normalizedCode === this.currentLanguageCode) {
            return;
        }

        const catalog = await this.loadLocaleCatalog(normalizedCode);
        if (!catalog) {
            return;
        }

        const componentKey = this.getLocaleComponentKey();
        if (!componentKey || !catalog[componentKey]) {
            this.currentLanguageCode = normalizedCode;
            return;
        }

        this.applyComponentLocale(catalog[componentKey]);
        this.currentLanguageCode = normalizedCode;
    }

    getTemplateHtml() {
        return `
                    <style>
                        ${w3_css}
                    </style>

                    <style>
                        :host {
                            display: block;
                        }

                        .link-card {
                            display: grid;
                            gap: 0.75rem;
                        }

                        .header-bar {
                            display: flex;
                            align-items: center;
                            gap: 0.5rem;
                            padding: var(--gc-header-padding, 0.5rem);
                            padding-top: var(--gc-header-padding-top, var(--gc-header-padding, 0.5rem));
                        }

                        .title-button {
                            display: inline-flex;
                            align-items: center;
                            justify-content: flex-start;
                            gap: 0.5rem;
                            width: ${this.getTitleButtonWidth()};
                            flex: 0 0 ${this.getTitleButtonWidth()};
                            text-align: left;
                        }

                        .button-label {
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }

                        .message-input {
                            flex: 1 1 auto;
                            min-width: 0;
                        }

                        .auto-indicator {
                            display: none;
                            font-size: 0.68rem;
                            font-weight: 700;
                            letter-spacing: 0.04em;
                            text-transform: uppercase;
                            color: #526071;
                            border: 1px solid #c8d0dc;
                            border-radius: 999px;
                            padding: 0.12rem 0.45rem;
                            background: #f8fafc;
                            user-select: none;
                        }

                        .auto-indicator[data-enabled="true"] {
                            color: #065f46;
                            border-color: #6ee7b7;
                            background: #ecfdf5;
                        }

                        .auto-indicator[data-enabled="false"] {
                            color: #64748b;
                            border-color: #cbd5e1;
                            background: #f8fafc;
                        }

                        .expand-collapse-icon {
                            display: inline-block;
                            width: 0.55rem;
                            height: 0.55rem;
                            border-right: 2px solid currentColor;
                            border-bottom: 2px solid currentColor;
                            transform: rotate(-45deg);
                            transform-origin: center;
                        }

                        .led-indicator {
                            width: 8px;
                            height: 8px;
                            min-width: 8px;
                            border-radius: 50%;
                            border: 1px solid rgba(47, 55, 68, 0.35);
                            background-color: #f0b429;
                            box-shadow: 0 0 0 2px rgba(47, 55, 68, 0.08);
                        }

                        .led-indicator[data-state="green"] {
                            background-color: #1a9b2e;
                        }

                        .led-indicator[data-state="yellow"] {
                            background-color: #f0b429;
                        }

                        .led-indicator[data-state="red"] {
                            background-color: #c0392b;
                        }

                        .body {
                            color: #1f2937;
                            line-height: 1.5;
                        }

                        ${this.getExtraStyles()}
                    </style>

                        <div id="linkCard" class="w3-container link-card">
                            <div class="header-bar">
                            <i id="expandCollapseButton" class="w3-button w3-border w3-round w3-light-gray w3-hover-gray w3-hide" title="Collapse/Expand" role="button" aria-label="Collapse/Expand"><span class="expand-collapse-icon" aria-hidden="true"></span></i>
                            <button id="openPortButton" class="w3-button w3-border w3-round title-button">
                                <span id="statusLED" class="led-indicator" data-state="red" role="img" aria-label="Link Status" title="Link"></span>
                                <span id="buttonLabel" class="button-label">Title</span>
                            </button>
                            <span id="autoIndicator" class="auto-indicator" data-enabled="false" title="Autoconnect disabled">Auto</span>
                            <input type="text" id="message" class="w3-input w3-border w3-round message-input" placeholder="Port input" readonly>
                        </div>
                        <div class="body">
                            ${this.getExtraMarkup()}
                            <slot></slot>
                        </div>
                    </div>
                `;
    }

    connectedCallback() {
        void this.replaceDataLinkIfNeeded();
        this.configureDataLinkFromAttributes();
        this.titleEl.addEventListener("click", this.onOpenPortClick);
        document.addEventListener("app-language-change", this.onLanguageChange);

        this.dataLink.addEventListener("app-log", this.onDataLinkLog);
        this.dataLink.addEventListener("port-status-change", this.onDataLinkStatus);
        this.dataLink.addEventListener("serial-line", this.onDataLinkLine);
        this.dataLink.startMonitoring?.();

        this.render();
        this.applyLanguage(this.getDefaultLanguageCode());
    }

    disconnectedCallback() {
        this.titleEl.removeEventListener("click", this.onOpenPortClick);
        document.removeEventListener("app-language-change", this.onLanguageChange);

        this.dataLink.removeEventListener("app-log", this.onDataLinkLog);
        this.dataLink.removeEventListener("port-status-change", this.onDataLinkStatus);
        this.dataLink.removeEventListener("serial-line", this.onDataLinkLine);
        this.dataLink.stopMonitoring?.();
        this.dataLink.disconnectPort({ intentional: true });
    }

    attributeChangedCallback(name) {
        if (name === "transport") {
            void this.replaceDataLinkIfNeeded(true);
        } else if (name === "ble-service-uuid" && this.getTransport() === "ble") {
            void this.replaceDataLinkIfNeeded(true);
        } else {
            this.configureDataLinkFromAttributes();
        }
        this.render();
    }

    onDataLinkLog(event) {
        const detail = event?.detail || {};
        this.emitAppLog(detail.level || "info", detail.message || "(no message)", {
            source: detail.source || this.id || this.tagName.toLowerCase(),
        });
    }

    onDataLinkStatus() {
        this.render();
    }

    onDataLinkLine(event) {
        const line = event?.detail?.line;
        if (typeof line !== "string") {
            return;
        }

        this.counter = Number.isFinite(event?.detail?.counter) ? event.detail.counter : this.counter + 1;
        const handled = this.processIncomingLine(line);

        if (!handled && this.messageEl) {
            this.messageEl.value = line;
        }

        this.statusLEDEl.setAttribute("counter", String(this.counter));
        this.dispatchEvent(
            new CustomEvent("serial-line", {
                detail: {
                    line,
                    handled,
                },
                bubbles: true,
                composed: true,
            }),
        );

        this.render();
    }

    async onOpenPortClick() {
        if (this.port) {
            await this.disconnectPort({ intentional: true });
            return;
        }

        await this.connectPort({ requestPortIfMissing: true });
    }

    async connectPort(options = {}) {
        await this.dataLink.connectPort(options);
    }

    async disconnectPort(options = {}) {
        await this.dataLink.disconnectPort(options);
    }

    async writeLine(text) {
        await this.dataLink.writeLine(text);
    }

    rememberCurrentPortHint(extra = {}) {
        this.dataLink.rememberCurrentPortHint(extra);
    }

    render() {
        const statusLabel = this.getStatusLabel();
        const status = this.dataLink.getPortStatus();
        const autoEnabled = status.autoConnectEnabled;

        this.buttonLabelEl.textContent = this.getButtonLabelText();
        this.statusLEDEl.dataset.state = this.getStatusState();
        this.statusLEDEl.title = statusLabel;
        this.statusLEDEl.setAttribute("aria-label", statusLabel);
        this.statusLEDEl.setAttribute("counter", String(this.counter));
        this.autoIndicatorEl.dataset.enabled = autoEnabled ? "true" : "false";
        this.autoIndicatorEl.title = autoEnabled ? "Autoconnect enabled" : "Autoconnect disabled";
        this.afterRender();
    }
}

export { GCLinkHost };
