class GcUsbLink extends EventTarget {
    constructor(options = {}) {
        super();
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
        this.autoConnectRequested = this.normalizeBooleanOption(options.autoconnect);
        this.autoConnectIntervalMs = this.normalizeAutoConnectIntervalMs(options.autoconnectIntervalMs);
        this.storageScope = options.storageScope || options.componentIdentifier || "default";
        this.componentIdentifier = options.componentIdentifier || "GcUsbLink";
        this.isMonitoring = false;
        this.linkState = "disconnected";
        this.onSerialDisconnect = this.onSerialDisconnect.bind(this);
        this.onSendCommandEvent = this.onSendCommandEvent.bind(this);
        this.configure(options);
    }

    configure(options = {}) {
        if (Object.prototype.hasOwnProperty.call(options, "autoconnect")) {
            this.autoConnectRequested = this.normalizeBooleanOption(options.autoconnect);
        }

        if (Object.prototype.hasOwnProperty.call(options, "autoconnectIntervalMs")) {
            this.autoConnectIntervalMs = this.normalizeAutoConnectIntervalMs(options.autoconnectIntervalMs);
        }

        if (Object.prototype.hasOwnProperty.call(options, "storageScope")) {
            this.storageScope = options.storageScope || "default";
        }

        if (Object.prototype.hasOwnProperty.call(options, "componentIdentifier")) {
            this.componentIdentifier = options.componentIdentifier || "GcUsbLink";
        }
    }

    normalizeBooleanOption(value) {
        return value === true || value === "true" || value === 1;
    }

    normalizeAutoConnectIntervalMs(value) {
        const parsed = Number.parseInt(String(value ?? "5000"), 10);
        return Number.isFinite(parsed) && parsed >= 1000 ? parsed : 5000;
    }

    async onPortConnected() { }

    async onPortDisconnected() { }

    emitAppLog(level, message, meta = {}) {
        this.dispatchEvent(
            new CustomEvent("app-log", {
                detail: {
                    level,
                    source: this.componentIdentifier || "GcUsbLink",
                    message,
                    ...meta,
                },
                bubbles: true,
                composed: true,
            }),
        );
    }

    getPortStatus() {
        return {
            state: this.linkState,
            isConnected: Boolean(this.port),
            isConnecting: this.isConnecting,
            autoConnectEnabled: this.autoConnectEnabled || this.isAutoConnectRequested(),
            counter: this.counter,
            portInfo: this.port?.getInfo?.() || null,
        };
    }

    updateLinkState(state) {
        if (this.linkState === state) {
            return;
        }

        this.linkState = state;
        this.dispatchEvent(
            new CustomEvent("port-status-change", {
                detail: this.getPortStatus(),
                bubbles: true,
                composed: true,
            }),
        );
    }

    isAutoConnectRequested() {
        return this.autoConnectRequested;
    }

    getAutoConnectIntervalMs() {
        return this.autoConnectIntervalMs;
    }

    getAutoConnectStorageScope() {
        return this.storageScope || this.componentIdentifier || "default";
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
        return info.usbVendorId === hint.usbVendorId && info.usbProductId === hint.usbProductId;
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

    startMonitoring() {
        if (this.isMonitoring) {
            return;
        }

        navigator.serial?.addEventListener("disconnect", this.onSerialDisconnect);
        if (typeof document !== "undefined") {
            document.addEventListener("gc-send-cmd", this.onSendCommandEvent);
        }
        this.isMonitoring = true;

        if (this.isAutoConnectRequested() && !this.port) {
            this.startAutoConnect();
        } else {
            this.updateLinkState(this.port ? "connected" : "disconnected");
        }
    }

    stopMonitoring() {
        if (!this.isMonitoring) {
            return;
        }

        navigator.serial?.removeEventListener("disconnect", this.onSerialDisconnect);
        if (typeof document !== "undefined") {
            document.removeEventListener("gc-send-cmd", this.onSendCommandEvent);
        }
        this.isMonitoring = false;
        this.stopAutoConnect();
    }

    onSendCommandEvent(event) {
        const detail = event?.detail;
        const textLine = typeof detail === "string" ? detail : detail?.textLine;
        if (this.linkState !== "connected" || !this.port?.writable) {
            this.emitAppLog("warn", "Ignoring gc-send-cmd: USB link is not connected", {
                command: textLine,
            });
            return;
        }
        this.writeLine(textLine).catch((error) => {
            this.emitAppLog("error", "Failed to send gc-send-cmd over USB", {
                command: textLine,
                error: String(error?.message || error),
            });
        });
    }

    enableAutoConnect() {
        this.autoConnectRequested = true;
        this.autoReconnectOnLoss = true;

        if (!this.port) {
            this.startAutoConnect();
        }
    }

    disableAutoConnect() {
        this.autoConnectRequested = false;
        this.autoReconnectOnLoss = false;
        this.stopAutoConnect();
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
        this.updateLinkState(this.autoReconnectOnLoss ? "reconnecting" : "disconnected");
        await this.onPortDisconnected();

        if (this.autoReconnectOnLoss) {
            this.startAutoConnect();
        }
    }

    onSerialDisconnect(event) {
        if (!this.port) {
            return;
        }

        if (event?.port === this.port) {
            this.handlePortLost(event);
        }
    }

    async connectPort(options = {}) {
        const { port = null, requestPortIfMissing = true } = options;

        if (!navigator.serial) {
            console.error("Web Serial API is not available in this browser.");
            this.updateLinkState("error");
            return;
        }

        if (this.isConnecting || this.port) {
            return;
        }

        this.isConnecting = true;
        this.updateLinkState("connecting");

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
            this.emitAppLog("info", "Serial port opened");
            await this.onPortConnected();
            this.updateLinkState("connected");
        } catch (error) {
            if (this.verbose) {
                console.error("Error opening serial port:", error);
            }
            this.emitAppLog("error", "Failed to open serial port");
            this.port = null;
            this.keepReading = false;
            this.updateLinkState("error");
        } finally {
            this.isConnecting = false;
            if (!this.port && this.linkState === "connecting") {
                this.updateLinkState("disconnected");
            }
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
            this.updateLinkState("disconnected");
        }
    }

    async writeLine(text) {
        if (!this.port?.writable) {
            throw new Error("Serial port is not writable.");
        }

        const writer = this.port.writable.getWriter();
        try {
            const normalizedText = String(text).replace(/[\r\n]+$/, "");
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
                this.updateLinkState("error");
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
        this.dispatchEvent(
            new CustomEvent("serial-line", {
                detail: { line: textLine, counter: this.counter },
                bubbles: true,
                composed: true,
            }),
        );  
        const normalizedLine = String(textLine || "").trim();
        if (!normalizedLine.startsWith("$F,")) {
            this.emitAppLog("debug", `RX ${normalizedLine}`);
        }
    }
}
export { GcUsbLink };