export class TransportService extends EventTarget {
    constructor({ transports = {} } = {}) {
        super();
        this.transports = new Map();
        this.listeners = new Map();
        Object.entries(transports).forEach(([name, transport]) => this.register(name, transport));
    }

    register(name, transport) {
        if (!transport || typeof transport.addEventListener !== "function") {
            throw new TypeError(`Transport ${name} must be an EventTarget`);
        }
        if (this.transports.has(name)) {
            throw new Error(`Transport ${name} is already registered`);
        }

        const forward = (type) => (event) => {
            this.dispatchEvent(new CustomEvent(type, {
                detail: { transport: name, ...event.detail },
            }));
        };
        const eventListeners = {
            "app-log": forward("app-log"),
            "port-status-change": forward("port-status-change"),
            "serial-line": forward("serial-line"),
        };
        Object.entries(eventListeners).forEach(([type, listener]) => transport.addEventListener(type, listener));
        this.transports.set(name, transport);
        this.listeners.set(name, eventListeners);
    }

    start() {
        this.transports.forEach((transport) => transport.startMonitoring?.());
    }

    stop({ disconnect = true } = {}) {
        this.transports.forEach((transport) => {
            transport.stopMonitoring?.();
            if (disconnect) {
                transport.disconnectPort?.({ intentional: true });
            }
        });
    }

    enableAutoConnect(name) {
        this.getTransport(name).enableAutoConnect?.();
    }

    connect(name) {
        return this.getTransport(name).connectPort();
    }

    disconnect(name) {
        return this.getTransport(name).disconnectPort({ intentional: true });
    }

    getStatus(name) {
        return this.getTransport(name).getPortStatus();
    }

    sendCommand(textLine, { target = "auto" } = {}) {
        const normalizedText = typeof textLine === "string" ? textLine.trim() : "";
        if (!normalizedText) {
            return false;
        }

        const targets = this.resolveTargets(target);
        const connectedTargets = targets.filter((name) => this.getStatus(name).state === "connected");
        if (connectedTargets.length === 0) {
            return false;
        }

        connectedTargets.forEach((name) => {
            this.getTransport(name).writeLine(normalizedText).catch((error) => {
                this.dispatchEvent(new CustomEvent("app-log", {
                    detail: {
                        transport: name,
                        level: "error",
                        source: "TransportService",
                        message: `Failed to send command over ${name.toUpperCase()}`,
                        command: normalizedText,
                        error: String(error?.message || error),
                    },
                }));
            });
        });
        return true;
    }

    resolveTargets(requestedTarget) {
        const target = String(requestedTarget || "auto").trim().toLowerCase();
        if (target === "all" || target === "any" || target === "both") {
            return [...this.transports.keys()];
        }
        if (this.transports.has(target)) {
            return [target];
        }

        const connected = [...this.transports.keys()].find(
            (name) => this.getStatus(name).state === "connected",
        );
        return connected ? [connected] : [];
    }

    getTransport(name) {
        const transport = this.transports.get(name);
        if (!transport) {
            throw new Error(`Unknown transport: ${name}`);
        }
        return transport;
    }
}