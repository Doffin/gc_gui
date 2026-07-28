let myUUID= '6e400001-b5a3-f393-e0a9-e50e24dcca9e';

class GcBleLink extends EventTarget {
    constructor(options = {}) {
        super();//6e400001-b5a3-f393-e0a9-e50e24dcca9e
        this.serviceUuid = options.serviceUuid || myUUID;//"00005500-d102-11e1-9b23-00025b00a5a5";
        this.componentIdentifier = options.componentIdentifier || "GCBLELink";

        this.decoder = new TextDecoder();
        this.encoder = new TextEncoder();
        this.readBuffer = "";
        this.counter = 0;
        this.isConnecting = false;
        this.linkState = "disconnected";

        this.device = null;
        this.server = null;
        this.service = null;
        this.notifyCharacteristic = null;
        this.writeCharacteristic = null;
        this.notificationsEnabled = false;

        this.onGattDisconnected = this.onGattDisconnected.bind(this);
        this.onCharacteristicValueChanged = this.onCharacteristicValueChanged.bind(this);
    }

    configure(options = {}) {
        if (Object.prototype.hasOwnProperty.call(options, "serviceUuid")) {
            this.serviceUuid = options.serviceUuid || myUUID;//"00005500-d102-11e1-9b23-00025b00a5a5";
        }
        if (Object.prototype.hasOwnProperty.call(options, "componentIdentifier")) {
            this.componentIdentifier = options.componentIdentifier || "GCBLELink";
        }
    }

    startMonitoring() {
        // BLE disconnects are tracked via GATT disconnect events while connected.
    }

    stopMonitoring() {
        // No periodic monitor is required for BLE transport.
    }

    rememberCurrentPortHint() {
        // Serial remembered-port behavior does not apply to BLE transport.
    }

    get port() {
        return this.server?.connected ? this.server : null;
    }

    emitAppLog(level, message, meta = {}) {
        this.dispatchEvent(
            new CustomEvent("app-log", {
                detail: {
                    level,
                    source: this.componentIdentifier,
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
            isConnected: this.isConnected(),
            isConnecting: this.isConnecting,
            autoConnectEnabled: false,
            counter: this.counter,
            transport: "ble",
            serviceUuid: this.serviceUuid,
            deviceName: this.device?.name || null,
            deviceId: this.device?.id || null,
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

    isConnected() {
        return Boolean(this.server?.connected && this.writeCharacteristic);
    }

    normalizeUuid(uuid) {
        return String(uuid || "").trim().toLowerCase();
    }

    async findPrimaryService(server) {
        const services = await server.getPrimaryServices();
        const availableUuids = services.map((service) => service.uuid);
        this.emitAppLog("info", `Discovered BLE services: ${availableUuids.join(", ") || "(none)"}`);

        const targetUuid = this.normalizeUuid(this.serviceUuid);
        const match = services.find((service) => this.normalizeUuid(service.uuid) === targetUuid);
        if (match) {
            return match;
        }

        throw new Error(`BLE UART service ${this.serviceUuid} not found on device`);
    }

    async onPortConnected() {}

    async onPortDisconnected() {}

    async connectPort(options = {}) {
        const { device = null, requestPortIfMissing = true } = options;

        if (!navigator.bluetooth) {
            this.emitAppLog("error", "Web Bluetooth API is not available in this browser");
            this.updateLinkState("error");
            return;
        }

        if (this.isConnecting || this.isConnected()) {
            return;
        }

        this.isConnecting = true;
        this.updateLinkState("connecting");
        console.log("Connecting to BLE link...");
        try {
            if (device) {
                this.device = device;
                console.log(`Using provided Bluetooth device: ${device.name || device.id}`);
            } else if (requestPortIfMissing) {
                this.emitAppLog("info", "Requesting Bluetooth LE device");
                this.device = await navigator.bluetooth.requestDevice({
                    filters: [{ namePrefix: 'du-' }],
                    optionalServices: [this.serviceUuid],
                });
       //         this.device = await navigator.bluetooth.requestDevice({
       //             acceptAllDevices: true,
       //             optionalServices: [this.serviceUuid],
       //         });
                this.emitAppLog("info", `Selected Bluetooth device: ${this.device.name || this.device.id}`);
            } else {
                this.updateLinkState("disconnected");
                return;
            }

            this.device.addEventListener("gattserverdisconnected", this.onGattDisconnected);
            this.emitAppLog("info", "Connecting to BLE GATT server");
            this.server = await this.device.gatt.connect();
            this.emitAppLog("info", "Discovering BLE primary services");
            this.service = await this.findPrimaryService(this.server);

            this.emitAppLog("info", `Using BLE service ${this.service.uuid}`);
            const characteristics = await this.service.getCharacteristics();
            this.emitAppLog("info", `Discovered ${characteristics.length} BLE characteristic(s)`);
            for (const characteristic of characteristics) {
                this.emitAppLog(
                    "debug",
                    `Characteristic ${characteristic.uuid} notify=${Boolean(characteristic.properties.notify)} write=${Boolean(characteristic.properties.write)} writeWithoutResponse=${Boolean(characteristic.properties.writeWithoutResponse)}`,
                );
                if (!this.notifyCharacteristic && characteristic.properties.notify) {
                    this.notifyCharacteristic = characteristic;
                }
                if (
                    !this.writeCharacteristic
                    && (characteristic.properties.write || characteristic.properties.writeWithoutResponse)
                ) {
                    this.writeCharacteristic = characteristic;
                }
            }

            if (!this.notifyCharacteristic || !this.writeCharacteristic) {
                throw new Error("BLE UART characteristics not found");
            }

            this.emitAppLog("info", `Using notify characteristic ${this.notifyCharacteristic.uuid}`);
            this.emitAppLog("info", `Using write characteristic ${this.writeCharacteristic.uuid}`);
            this.emitAppLog("info", "Enabling BLE notifications");
            this.notifyCharacteristic.addEventListener(
                "characteristicvaluechanged",
                this.onCharacteristicValueChanged,
            );
            try {
                this.notificationsEnabled = true;
                this.emitAppLog("info", "Starting BLE notifications");
                await this.notifyCharacteristic.startNotifications();
                this.emitAppLog("info", "BLE notifications started");
            } catch (error) {
                if (error?.name === "InvalidModificationError") {
                    this.emitAppLog(
                        "warn",
                        "BLE notifications could not be enabled; continuing with write-only connection attempt",
                        { error: String(error?.message || error) },
                    );
                } else {
                    throw error;
                }
            }

            this.readBuffer = "";
            this.emitAppLog("info", "Bluetooth LE UART connected");
            this.emitAppLog("info", "Calling host onPortConnected hook");
            await this.onPortConnected();
            this.emitAppLog("info", "Host onPortConnected hook completed");
            this.updateLinkState("connected");
        } catch (error) {
            if (error?.name === "NotFoundError") {
                this.emitAppLog("warn", "Bluetooth device selection was cancelled or no device was chosen");
                await this.cleanupConnectionState();
                this.updateLinkState("disconnected");
                return;
            }
            console.error("Error connecting BLE link:", error);
            this.emitAppLog("error", "Failed to connect BLE link", { error: String(error?.message || error) });
            await this.cleanupConnectionState();
            this.updateLinkState("error");
        } finally {
            this.isConnecting = false;
            if (!this.isConnected() && this.linkState === "connecting") {
                this.updateLinkState("disconnected");
            }
        }
    }

    async disconnectPort(options = {}) {
        const { intentional = false } = options;

        if (!this.device && !this.server) {
            this.updateLinkState("disconnected");
            return;
        }

        try {
            if (this.notifyCharacteristic) {
                try {
                    this.notifyCharacteristic.removeEventListener(
                        "characteristicvaluechanged",
                        this.onCharacteristicValueChanged,
                    );
                    if (this.notificationsEnabled) {
                        await this.notifyCharacteristic.stopNotifications();
                    }
                } catch {
                    // ignore notification cleanup errors
                }
            }

            if (this.device) {
                this.device.removeEventListener("gattserverdisconnected", this.onGattDisconnected);
            }

            if (this.server?.connected) {
                this.server.disconnect();
            }
        } catch (error) {
            console.error("Error disconnecting BLE link:", error);
            this.emitAppLog("warn", "Error disconnecting BLE link");
        } finally {
            await this.cleanupConnectionState();
            await this.onPortDisconnected();
            if (intentional) {
                this.emitAppLog("info", "Bluetooth LE UART disconnected");
            }
            this.updateLinkState("disconnected");
        }
    }

    async cleanupConnectionState() {
        this.notifyCharacteristic = null;
        this.writeCharacteristic = null;
        this.notificationsEnabled = false;
        this.service = null;
        this.server = null;
        this.device = null;
        this.readBuffer = "";
    }

    async writeLine(text) {
        if (!this.writeCharacteristic) {
            throw new Error("BLE link is not writable.");
        }

        const normalizedText = String(text).replace(/[\r\n]+$/, "");
        const payload = this.encoder.encode(`${normalizedText}\r\n`);
        this.emitAppLog("debug", `TX ${normalizedText}`);
        await this.writeCharacteristic.writeValue(payload);
    }

    async write(data) {
        if (!this.writeCharacteristic) {
            throw new Error("BLE link is not writable.");
        }

        const payload = typeof data === "string" ? this.encoder.encode(data) : data;
        await this.writeCharacteristic.writeValue(payload);
    }

    onGattDisconnected() {
        this.handlePortLost();
    }

    async handlePortLost(error = null) {
        if (!this.device && !this.server && !this.notifyCharacteristic && !this.writeCharacteristic) {
            return;
        }

        if (error) {
            this.emitAppLog("warn", "Bluetooth LE device disconnected", {
                error: String(error?.message || error),
            });
        } else {
            this.emitAppLog("warn", "Bluetooth LE device disconnected");
        }

        await this.cleanupConnectionState();
        await this.onPortDisconnected();
        this.updateLinkState("disconnected");
    }

    onCharacteristicValueChanged(event) {
        const value = event?.target?.value;
        if (!value) {
            return;
        }

        const bytes = value.buffer ? new Uint8Array(value.buffer, value.byteOffset, value.byteLength) : value;
        this.pushChunk(bytes);
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
        this.counter += 1;
        this.dispatchEvent(
            new CustomEvent("serial-line", {
                detail: {
                    line: textLine,
                    counter: this.counter,
                },
                bubbles: true,
                composed: true,
            }),
        );

        //this.emitAppLog("debug", `RX ${textLine}`);
    }
}

export { GcBleLink };