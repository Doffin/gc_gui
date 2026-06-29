import { GCSerialPort } from "./gc-serialport.js";

class GCDULink extends GCSerialPort {
    static get observedAttributes() {
        return ["title", "counter"];
    }

    isAutoConnectRequested() {
        const value = this.getAttribute("autoconnect");
        return value == null ? true : value !== "false";
    }

    getExtraStyles() {
        return `
        .du-toggle {
                transition: background-color 180ms ease;
            }

        .du-toggle .expand-collapse-icon {
                transition: transform 180ms ease;
            }

        .du-toggle[data-expanded="true"] .expand-collapse-icon {
                transform: rotate(45deg);
            }

      .du-metrics {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 0.75rem;
        padding: 0.75rem;
        overflow: hidden;
        max-height: 56rem;
        opacity: 1;
        transform: scaleY(1);
        transform-origin: top;
        transition: max-height 180ms ease, opacity 180ms ease, transform 180ms ease, padding 180ms ease;
      }

      .du-metrics[data-collapsed="true"] {
        max-height: 0;
        opacity: 0;
        transform: scaleY(0.96);
        padding-top: 0;
        padding-bottom: 0;
        border-width: 0;
      }

      .metric-item {
        padding: 1rem;
        border: 1px solid #d9dee8;
        border-radius: 0.5rem;
        background: #f8fafc;
      }

      .metric-label {
        margin: 0 0 0.35rem;
        font-size: 0.8rem;
        color: #526071;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .metric-value {
        margin: 0;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        font-size: clamp(1.75rem, 2vw + 1rem, 2.20rem);
        font-weight: 700;
        color: #1f2937;
        line-height: 1.1;
      }

      .metric-unit {
        margin-left: 0.35rem;
        font-size: 1rem;
        font-weight: 500;
        color: #526071;
      }

      .message-input {
        display: none;
      }
      
.realtime-pump-controls {
  width: 100%;
  display: flex;
  align-items: stretch;
  justify-content: center;
}

.pump-control-bar {
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 2px;
}

.pump-control-button {
  flex: 1 1 0;
  min-height: 44px;
  padding: 0;
  border-radius: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
  background-color: #2196f3 !important;
  color: #fff !important;
}

.pump-control-bar .pump-control-button:first-child {
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
}

.pump-control-bar .pump-control-button:last-child {
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
}

.pump-control-button:hover,
.pump-control-button:focus,
.pump-control-button:active {
  background-color: #2196f3 !important;
  color: #fff !important;
}

.pump-icon {
  width: 18px;
  height: 18px;
  display: block;
  fill: currentColor;
}

.pump-control-button.is-active {
  background-color: #2196f3 !important;
  border-color: #0f4e82;
  box-shadow: inset 0 0 0 1px #0f4e82;
}

.pump-control-button.is-active:hover,
.pump-control-button.is-active:focus,
.pump-control-button.is-active:active {
  background-color: #2196f3 !important;
  color: #fff !important;
}

.pump-control-button:not(.is-active) {
  opacity: 1;
}

.pump-control-button:not(.is-active):hover,
.pump-control-button:not(.is-active):focus,
.pump-control-button:not(.is-active):active {
  background-color: #2196f3 !important;
  color: #fff !important;
}

.pump-control-button.is-pending {
  border-color: #ffffff;
  box-shadow: inset 0 0 0 2px #ffffff, 0 0 0 2px #0f4e82;
  animation: pump-pending-pulse 700ms ease-in-out infinite;
}

@keyframes pump-pending-pulse {
  0% {
    filter: brightness(1);
  }

  50% {
    filter: brightness(1.12);
  }

  100% {
    filter: brightness(1);
  }
}

    `;
    }

    getExtraMarkup() {
        return `
      <div id="duMetrics" class="w3-container w3-card-4 w3-round du-metrics w3-light-gray">
        <div class="metric-item">
          <p class="metric-label" id="pressureLabel">Pressure</p>
          <p class="metric-value"><span id="currentPressure">0,0</span> <span class="metric-unit" id="pressureUnit">kPa</span></p>
        </div>
        <div class="metric-item">
          <p class="metric-label" id="forceLabel">Kraft</p>
          <p class="metric-value"><span id="currentForce">0,00</span> <span class="metric-unit" id="forceUnit">kN</span></p>
        </div>
        <div class="metric-item">
          <p class="metric-label" id="distanceLabel">Setning</p>
          <p class="metric-value"><span id="currentDistance">0,00</span> <span class="metric-unit" id="distanceUnit">mm</span></p>
        </div>
        <div class="metric-item w3-hide">
          <p class="metric-label" id="pumpStateLabel">Pump State</p>
          <p class="metric-value"><span id="pumpState">0</span></p>
        </div>
        <div class="metric-item">
          <div class="realtime-pump-controls" aria-label="Pump controls">
            <div class="pump-control-bar">
              <button class="w3-button w3-blue pump-control-button" id="pumpUPButton" aria-label="Pump up" title="Pump UP">
                <svg class="pump-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M12 4l-7 7h4v9h6v-9h4z"></path>
                </svg>
              </button>
              <button class="w3-button w3-blue pump-control-button" id="pumpSTOPButton" aria-label="Pump stop"
                title="Pump STOP">
                <svg class="pump-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M7 5h4v14H7zm6 0h4v14h-4z"></path>
                </svg>
              </button>
              <button class="w3-button w3-blue pump-control-button" id="pumpDOWNButton" aria-label="Pump down"
                title="Pump DOWN">
                <svg class="pump-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M12 20l7-7h-4V4H9v9H5z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

      </div>
    `;
    }

    constructor() {
        super();
        this.shadowRoot.getElementById("linkCard").classList.add("w3-quarter");
        this.expandCollapseButtonEl = this.shadowRoot.getElementById("expandCollapseButton");
        this.expandCollapseButtonEl.classList.remove("w3-hide");
        this.expandCollapseButtonEl.classList.add("du-toggle");
        this.metricsEl = this.shadowRoot.getElementById("duMetrics");
        this.pumpStateEl = this.shadowRoot.getElementById("pumpState");
        this.pumpUpButtonEl = this.shadowRoot.getElementById("pumpUPButton");
        this.pumpStopButtonEl = this.shadowRoot.getElementById("pumpSTOPButton");
        this.pumpDownButtonEl = this.shadowRoot.getElementById("pumpDOWNButton");
        this.currentPressureEl = this.shadowRoot.getElementById("currentPressure");
        this.currentForceEl = this.shadowRoot.getElementById("currentForce");
        this.currentDistanceEl = this.shadowRoot.getElementById("currentDistance");
        this.isExpanded = false;
        this.deviceInfo = {
            name: null,
            swVersion: null,
            hwVersion: null,
        };
        this.telemetry = {
            force: null,
            pressure: null,
            distance: null,
            pumpState: null,
        };
        this.onToggleExpanded = this.onToggleExpanded.bind(this);
        this.onPumpUpClick = this.onPumpUpClick.bind(this);
        this.onPumpStopClick = this.onPumpStopClick.bind(this);
        this.onPumpDownClick = this.onPumpDownClick.bind(this);
        this.pendingPumpState = null;
        this.pendingPumpStateTimer = null;
        this.expandCollapseButtonEl.addEventListener("click", this.onToggleExpanded);
        this.pumpUpButtonEl.addEventListener("click", this.onPumpUpClick);
        this.pumpStopButtonEl.addEventListener("click", this.onPumpStopClick);
        this.pumpDownButtonEl.addEventListener("click", this.onPumpDownClick);
        this.updatePumpButtonState();
    }

    disconnectedCallback() {
        this.expandCollapseButtonEl?.removeEventListener("click", this.onToggleExpanded);
        this.pumpUpButtonEl?.removeEventListener("click", this.onPumpUpClick);
        this.pumpStopButtonEl?.removeEventListener("click", this.onPumpStopClick);
        this.pumpDownButtonEl?.removeEventListener("click", this.onPumpDownClick);
        this.clearPendingPumpState();
        super.disconnectedCallback();
    }

    addTrace(direction, text) {
        let level = "debug";
        if (direction === "ERR") {
            level = "error";
        }
        if (direction === "RX" && text.startsWith("$version,")) {
            level = "info";
        }
        this.emitAppLog(level, `${direction}: ${text}`);
    }

    async sendPumpCommand(commandValue, expectedPumpState) {
        if (!this.port) {
            return;
        }

        const command = `pump=${commandValue}`;
        try {
            this.setPendingPumpState(expectedPumpState);
            this.addTrace("TX", command);
            await this.writeLine(command);
        } catch (error) {
            this.clearPendingPumpState();
            this.addTrace("ERR", `TX failed: ${command}`);
            console.error("Failed to send pump command:", command, error);
        }
    }

      onPumpUpClick() {
      this.sendPumpCommand("up", 1);
      }

      onPumpStopClick() {
      this.sendPumpCommand("stop", 0);
      }

      onPumpDownClick() {
      this.sendPumpCommand("down", 2);
    }

    setPendingPumpState(expectedState) {
      this.clearPendingPumpState();
      this.pendingPumpState = expectedState;
      this.pendingPumpStateTimer = setTimeout(() => {
        this.clearPendingPumpState();
        this.updatePumpButtonState();
      }, 2000);
      this.updatePumpButtonState();
    }

    clearPendingPumpState() {
      if (this.pendingPumpStateTimer) {
        clearTimeout(this.pendingPumpStateTimer);
        this.pendingPumpStateTimer = null;
      }
      this.pendingPumpState = null;
      }

    onToggleExpanded() {
        if (!this.port) {
            return;
        }

        this.isExpanded = !this.isExpanded;
        this.render();
    }

    getButtonLabelText() {
        return this.deviceInfo.name || this.getAttribute("title") || "DU";
    }

    async onPortConnected() {
        this.isExpanded = true;
        this.deviceInfo = {
            name: null,
            swVersion: null,
            hwVersion: null,
        };

        try {
            await new Promise((resolve) => setTimeout(resolve, 150));
            const cmd = "version?";
          this.addTrace("TX", cmd);
            console.log("Requesting DU version with command:", cmd);
            await this.writeLine(cmd);
        } catch (error) {
          this.addTrace("ERR", "TX failed: version?");
            console.error("Failed to request DU version:", error);
        }
    }

    async onPortDisconnected() {
        this.isExpanded = false;
      this.clearPendingPumpState();
        this.deviceInfo = {
            name: null,
            swVersion: null,
            hwVersion: null,
        };
    }

    processIncomingLine(line) {
      this.addTrace("RX", line);
        const versionInfo = this.parseVersionResponse(line);
        if (versionInfo) {
            this.deviceInfo = versionInfo;
            this.rememberCurrentPortHint({
                deviceType: "du",
                name: versionInfo.name,
                swVersion: versionInfo.swVersion,
                hwVersion: versionInfo.hwVersion,
            });
            this.messageEl.value = line;
            return true;
        }

        if (!line.startsWith("$GCfpsP")) {
            return false;
        }

        const telemetry = this.parsePressureSentence(line);
        if (!telemetry) {
            this.messageEl.value = line;
            return true;
        }

        this.telemetry = telemetry;
        this.messageEl.value = line;
        this.updateTelemetryFields();
        return true;
    }

    parsePressureSentence(sentence) {
        const payload = sentence.split("*")[0];
        const parts = payload.split(",").map((part) => part.trim());
        if (parts[0] !== "$GCfpsP") {
            return null;
        }

        const positionalValues = parts.slice(1, 5);
        if (positionalValues.length < 4) {
            return null;
        }

        return {
            force: this.parseNumber(positionalValues[0]),
            pressure: this.parseNumber(positionalValues[1]),
            distance: this.parseNumber(positionalValues[2]),
            pumpState: this.parsePumpState(positionalValues[3]),
        };
    }

    parseVersionResponse(line) {
        const normalized = line.trim();
        if (!normalized) {
            return null;
        }

        if (normalized.startsWith("$version,")) {
            const jsonPayload = normalized.slice("$version,".length);
            try {
                const parsed = JSON.parse(jsonPayload);
                if (!parsed || typeof parsed !== "object") {
                    return null;
                }

                return {
                    name: typeof parsed.name === "string" ? parsed.name.toUpperCase() : null,
                    swVersion: typeof parsed.fw === "string" ? parsed.fw : null,
                    hwVersion: typeof parsed.hw === "string" ? parsed.hw : null,
                };
            } catch (error) {
                console.error("Failed to parse DU version response:", error, normalized);
                return null;
            }
        }

        const csvCandidate = normalized.split("*")[0];
        const csvParts = csvCandidate.split(",").map((part) => part.trim()).filter(Boolean);
        if (csvParts.length >= 3 && this.looksLikeDeviceName(csvParts[0])) {
            return {
                name: csvParts[0],
                swVersion: csvParts[1] || null,
                hwVersion: csvParts[2] || null,
            };
        }

        const prefixedCsv = csvParts[0]?.toLowerCase().includes("version") ? csvParts.slice(1) : null;
        if (prefixedCsv && prefixedCsv.length >= 3 && this.looksLikeDeviceName(prefixedCsv[0])) {
            return {
                name: prefixedCsv[0],
                swVersion: prefixedCsv[1] || null,
                hwVersion: prefixedCsv[2] || null,
            };
        }

        const nameMatch = normalized.match(/\bDU\d+\b/i);
        if (!nameMatch) {
            return null;
        }

        const versionMatches = [...normalized.matchAll(/\b(?:sw|hw)[-_ ]?version[:= ]*([^,\s]+)/gi)];
        return {
            name: nameMatch[0].toUpperCase(),
            swVersion: versionMatches.find((match) => match[0].toLowerCase().startsWith("sw"))?.[1] || null,
            hwVersion: versionMatches.find((match) => match[0].toLowerCase().startsWith("hw"))?.[1] || null,
        };
    }

    looksLikeDeviceName(value) {
        return /^DU\d+$/i.test(value);
    }

    parseNumber(value) {
        const numeric = Number.parseFloat(value);
        return Number.isFinite(numeric) ? numeric : null;
    }

    parsePumpState(value) {
        const state = Number.parseInt(value, 10);
        if (!Number.isInteger(state)) {
            return null;
        }

        return state;
    }

    updateTelemetryFields() {
        this.pumpStateEl.textContent = this.formatPumpState(this.telemetry.pumpState);
        this.currentPressureEl.textContent = this.formatMetric(this.telemetry.pressure, 2, "0.00");
        this.currentForceEl.textContent = this.formatMetric(this.telemetry.force, 2, "0.00");
        this.currentDistanceEl.textContent = this.formatMetric(this.telemetry.distance, 2, "0.00");

      if (this.pendingPumpState != null && this.telemetry.pumpState === this.pendingPumpState) {
        this.clearPendingPumpState();
      }

      this.updatePumpButtonState();
    }

    updatePumpButtonState() {
      this.pumpUpButtonEl.classList.toggle("is-active", this.telemetry.pumpState === 1);
      this.pumpStopButtonEl.classList.toggle("is-active", this.telemetry.pumpState === 0);
      this.pumpDownButtonEl.classList.toggle("is-active", this.telemetry.pumpState === 2);

      this.pumpUpButtonEl.classList.toggle("is-pending", this.pendingPumpState === 1);
      this.pumpStopButtonEl.classList.toggle("is-pending", this.pendingPumpState === 0);
      this.pumpDownButtonEl.classList.toggle("is-pending", this.pendingPumpState === 2);

      const buttonsDisabled = !this.port;
      this.pumpUpButtonEl.disabled = buttonsDisabled;
      this.pumpStopButtonEl.disabled = buttonsDisabled;
      this.pumpDownButtonEl.disabled = buttonsDisabled;
    }

    afterRender() {
        const shouldShowMetrics = Boolean(this.port && this.isExpanded);
        this.metricsEl.dataset.collapsed = shouldShowMetrics ? "false" : "true";
        this.expandCollapseButtonEl.dataset.expanded = shouldShowMetrics ? "true" : "false";
        this.expandCollapseButtonEl.setAttribute("aria-label", shouldShowMetrics ? "Hide measurements" : "Show measurements");
        this.expandCollapseButtonEl.title = shouldShowMetrics ? "Hide measurements" : "Show measurements";
        this.buttonLabelEl.title = this.deviceInfo.swVersion || this.deviceInfo.hwVersion
            ? `${this.getStatusLabel()} | SW ${this.deviceInfo.swVersion || "--"} | HW ${this.deviceInfo.hwVersion || "--"}`
            : this.getStatusLabel();
        this.updatePumpButtonState();
    }

    formatPumpState(state) {
        return state == null ? "0" : String(state);
    }

    formatMetric(value, decimals, fallbackValue) {
        return value == null ? fallbackValue : value.toFixed(decimals);
    }

}

customElements.define("gc-du-link", GCDULink);
