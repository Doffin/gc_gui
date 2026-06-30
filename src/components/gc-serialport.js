import w3_css from "./w3.css?inline";
import { loadLanguageCatalog, normalizeLanguageCode } from "./locale/locale-loader.js";

class GCSerialPort extends HTMLElement {
    static get observedAttributes() {
        return ["title", "counter"];
    }

    constructor() {
        super();
        const root = this.attachShadow({ mode: "open" });
        root.innerHTML = this.getTemplateHtml();

        this.titleEl = root.getElementById("openPortButton");
        this.buttonLabelEl = root.getElementById("buttonLabel");
        this.autoIndicatorEl = root.getElementById("autoIndicator");
        this.messageEl = root.getElementById("message");
        this.statusLEDEl = root.getElementById("statusLED");
        this.counter = 0;
        this.verbose = false;
        this.port = null;
        this.reader = null;
        this.keepReading = false;
        this.isConnecting = false;
        this.readBuffer = "";
        this.decoder = new TextDecoder();
        this.encoder = new TextEncoder();
        this.autoConnectTimer = null;
        this.autoConnectEnabled = false;
        this.autoReconnectOnLoss = false;
        this.currentLanguageCode = null;
        this.onOpenPortClick = this.onOpenPortClick.bind(this);
        this.onSerialDisconnect = this.onSerialDisconnect.bind(this);
        this.onLanguageChange = this.onLanguageChange.bind(this);
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

    isAutoConnectRequested() {
        const value = this.getAttribute("autoconnect");
        if (value == null) {
            return false;
        }

        return value !== "false";
    }

    getAutoConnectIntervalMs() {
        const value = Number.parseInt(this.getAttribute("autoconnect-interval-ms") || "5000", 10);
        return Number.isFinite(value) && value >= 1000 ? value : 5000;
    }

    getAutoConnectStorageScope() {
        return `${this.tagName.toLowerCase()}:${this.id || this.getAttribute("title") || "default"}`;
    }

    getRememberedPortStorageKey() {
        return `gc.serial.rememberedPort.${this.getAutoConnectStorageScope()}`;
    }

    getRememberedPortHint() {
        try {
            const raw = localStorage.getItem(this.getRememberedPortStorageKey());
            if (!raw) {
                return null;
            }

            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === "object" ? parsed : null;
        } catch {
            return null;
        }
    }

    clearRememberedPortHint() {
        localStorage.removeItem(this.getRememberedPortStorageKey());
    }

    rememberCurrentPortHint(extra = {}) {
        if (!this.port) {
            return;
        }

        const info = this.port.getInfo();
        const payload = {
            usbVendorId: info.usbVendorId ?? null,
            usbProductId: info.usbProductId ?? null,
            updatedAt: new Date().toISOString(),
            ...extra,
        };

        localStorage.setItem(this.getRememberedPortStorageKey(), JSON.stringify(payload));
    }

    isSamePort(port, hint) {
        if (!port || !hint) {
            return false;
        }

        const info = port.getInfo();
        return (
            info.usbVendorId === hint.usbVendorId
            && info.usbProductId === hint.usbProductId
        );
    }

    async tryAutoConnect() {
        if (!this.autoConnectEnabled || this.port || this.isConnecting || !navigator.serial) {
            return;
        }

        const hint = this.getRememberedPortHint();
        if (!hint) {
            return;
        }

        const ports = await navigator.serial.getPorts();
        const match = ports.find((port) => this.isSamePort(port, hint));
        if (!match) {
            return;
        }

        await this.connectPort({ port: match, requestPortIfMissing: false });
    }

    startAutoConnect() {
        this.stopAutoConnect();
        this.autoConnectEnabled = true;
        this.tryAutoConnect();
        this.autoConnectTimer = setInterval(() => {
            this.tryAutoConnect();
        }, this.getAutoConnectIntervalMs());
    }

    stopAutoConnect() {
        this.autoConnectEnabled = false;
        if (this.autoConnectTimer) {
            clearInterval(this.autoConnectTimer);
            this.autoConnectTimer = null;
        }
    }

    enableAutoConnect() {
        this.setAttribute("autoconnect", "true");
        this.autoReconnectOnLoss = true;

        if (!this.port) {
            this.startAutoConnect();
        }
    }

    disableAutoConnect() {
        this.setAttribute("autoconnect", "false");
        this.autoReconnectOnLoss = false;
        this.stopAutoConnect();
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
                            border: 1px solid #ff0000;

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
        this.titleEl.addEventListener("click", this.onOpenPortClick);
        navigator.serial?.addEventListener("disconnect", this.onSerialDisconnect);
        document.addEventListener("app-language-change", this.onLanguageChange);
        this.render();
        this.applyLanguage(this.getDefaultLanguageCode());
    }

    disconnectedCallback() {
        this.titleEl.removeEventListener("click", this.onOpenPortClick);
        navigator.serial?.removeEventListener("disconnect", this.onSerialDisconnect);
        document.removeEventListener("app-language-change", this.onLanguageChange);
        this.stopAutoConnect();
        this.disconnectPort();
    }

    isPortLostError(error) {
        return error?.name === "NetworkError" || /device has been lost/i.test(String(error?.message || ""));
    }

    async handlePortLost(error = null) {
        if (!this.port && !this.reader) {
            return;
        }

        if (error) {
            console.warn("Serial device disconnected:", error);
            this.emitAppLog("warn", "Serial device disconnected");
        }

        this.keepReading = false;
        this.reader = null;
        this.port = null;
        await this.onPortDisconnected();

        if (this.autoReconnectOnLoss) {
            this.startAutoConnect();
        }

        this.render();
    }

    onSerialDisconnect(event) {
        if (!this.port) {
            return;
        }

        if (event?.port === this.port) {
            this.handlePortLost(event);
        }
    }

    attributeChangedCallback() {
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
        const { port = null, requestPortIfMissing = false } = options;

        if (!navigator.serial) {
            console.error("Web Serial API is not available in this browser.");
            return;
        }

        if (this.isConnecting || this.port) {
            return;
        }

        this.isConnecting = true;

        try {
            if (port) {
                this.port = port;
            } else if (requestPortIfMissing) {
                this.port = await navigator.serial.requestPort();
            } else {
                this.port = null;
                return;
            }

            await this.port.open({ baudRate: 115200 });
            this.keepReading = true;
            this.readBuffer = "";
            this.readLoop();
            this.rememberCurrentPortHint();
            this.autoReconnectOnLoss = this.isAutoConnectRequested();
            this.stopAutoConnect();
            console.log("Serial port opened:", this.port);
            this.emitAppLog("info", "Serial port opened");
            await this.onPortConnected();
            this.render();
        } catch (error) {
            if(this.verbose) {
                console.error("Error opening serial port:", error);
            }
            this.emitAppLog("error", "Failed to open serial port");
            this.port = null;
            this.keepReading = false;
            this.render();
        } finally {
            this.isConnecting = false;
        }
    }

    async disconnectPort(options = {}) {
        const { intentional = false } = options;

        if (intentional) {
            this.autoReconnectOnLoss = false;
            this.stopAutoConnect();
        }

        this.keepReading = false;
        const reader = this.reader;
        this.reader = null;

        try {
            if (reader) {
                await reader.cancel();
                try {
                    reader.releaseLock();
                } catch {
                    // reader may already be released by readLoop cleanup
                }
            }
        } catch (error) {
            console.error("Error stopping serial reader:", error);
            this.emitAppLog("warn", "Error stopping serial reader");
        }

        try {
            if (this.port) {
                await this.port.close();
            }
        } catch (error) {
            console.error("Error closing serial port:", error);
            this.emitAppLog("warn", "Error closing serial port");
        } finally {
            this.port = null;
            await this.onPortDisconnected();
            this.emitAppLog("info", "Serial port closed");
            this.render();
        }
    }

    async writeLine(text) {
        if (!this.port?.writable) {
            throw new Error("Serial port is not writable.");
        }

        const writer = this.port.writable.getWriter();
        try {
            const normalizedText = String(text).replace(/[\r\n]+$/, "");
            console.log("Writing to serial port:", normalizedText);
            this.emitAppLog("debug", `TX ${normalizedText}`);
            await writer.write(this.encoder.encode(`${normalizedText}\r\n`));
        } finally {
            writer.releaseLock();
        }
    }

    async readLoop() {
        if (!this.port?.readable) {
            return;
        }

        let reader;
        try {
            reader = this.port.readable.getReader();
            this.reader = reader;

            while (this.keepReading) {
                const { value, done } = await reader.read();
                if (done) {
                    break;
                }

                if (value) {
                    this.pushChunk(value);
                }
            }
        } catch (error) {
            if (this.keepReading && this.isPortLostError(error)) {
                await this.handlePortLost(error);
            } else if (this.keepReading) {
                console.error("Error while reading serial data:", error);
                this.emitAppLog("error", "Error while reading serial data");
            }
        } finally {
            try {
                reader?.releaseLock();
            } catch {
                // ignore release errors during shutdown
            }
            if (this.reader === reader) {
                this.reader = null;
            }
        }
    }

    pushChunk(chunk) {
        this.readBuffer += this.decoder.decode(chunk, { stream: true });
        const lines = this.readBuffer.split(/\r?\n/);
        this.readBuffer = lines.pop() || "";

        for (const line of lines) {
            this.handleIncoming(line);
        }
    }

    handleIncoming(textLine) {
        this.counter++;
        const handled = this.processIncomingLine(textLine);
        if (!handled) {
            console.log("Received unhandled line:", textLine);
            this.messageEl.value = textLine;
        }
        this.statusLEDEl.setAttribute("counter", this.counter);
        this.dispatchEvent(
            new CustomEvent("serial-line", {
                detail: {
                    line: textLine,
                    handled,
                },
                bubbles: true,
                composed: true,
            }),
        );
        this.render();
    }

    render() {
        const statusLabel = this.getStatusLabel();
        const autoEnabled = this.autoConnectEnabled || this.isAutoConnectRequested();
        this.buttonLabelEl.textContent = this.getButtonLabelText();
        this.statusLEDEl.dataset.state = this.getStatusState();
        this.statusLEDEl.title = statusLabel;
        this.statusLEDEl.setAttribute("aria-label", statusLabel);
        this.statusLEDEl.setAttribute("counter", this.counter);
        this.autoIndicatorEl.dataset.enabled = autoEnabled ? "true" : "false";
        this.autoIndicatorEl.title = autoEnabled ? "Autoconnect enabled" : "Autoconnect disabled";
        this.afterRender();
    }
}

customElements.define("gc-serialport", GCSerialPort);
export { GCSerialPort };