
import w3_css from "./w3.css?inline";
import { GcUsbLink } from "./gc-usblink.js";
import { GcBleLink } from "./gc-blelink.js";
import { GCProcedureBar } from "./gc-procedure-bar.js";
import { GCRealtime } from "./gc-realtime.js";
import { GCPumpControl } from "./gc-pump-control.js";
import { TestProcedureController } from "../controllers/test-procedure-controller.js";
import { TransportService } from "../services/transport-service.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    ${w3_css}
  </style>

  <style>
    :host {
      display: block;
    }

    .body {
      color: #1f2937;
      line-height: 1.5;
      width: 100%;
      height: auto;
      overflow: auto;
    }
 
    #realtimeUpdates {
        --row-height: 56px;
        font-size: 36px;
        font-weight: bold;
    }

    #realtimeUpdates li {
        height: var(--row-height);
        min-height: var(--row-height);
        display: flex;
        align-items: center;            
    }

    #realtimeUpdates li:empty::before {
        content: "\\00a0";
    }

.realtime-controls {
  width: 100%;
  display: flex;
  align-items: stretch;
  justify-content: center;
}

.top-bar {
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 12px;
  justify-content: left;
  margin: 6px;
}

.control-bar {
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 2px;
  margin-bottom: 4px;
}

.control-button {
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
  font-size:12px;
}

.control-bar .control-button:first-child {
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
}

.control-bar .control-button:last-child {
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
}

.control-button.is-active {
  background-color: #2196f3 !important;
  border-color: #0f4e82;
  box-shadow: inset 0 0 0 1px #0f4e82;
}

       
</style>
   
  <div class="w3-container w3-margin-bottom">
    <div class="body">
        <h2 id="title" class="w3-center w3-text-blue w3-medium w3-left">Table</h2>
        <div class="w3-container w3-padding">
        <gc-realtime id="targetPressure" label="Target Pressure" value=0.0 unit="kPa" decimals=1 componentIdentifier="targetPressure"></gc-realtime>
        <gc-realtime id="pressure" label="Pressure" value=0.0 unit="kPa" decimals=1 componentIdentifier="pressure"></gc-realtime>
        <gc-realtime id="force" label="Force" value=0.0 unit="kN" decimals=2 componentIdentifier="force"></gc-realtime>
        <gc-realtime id="distance" label="Distance" value=0.000 unit="mm" decimals=3 componentIdentifier="distance"></gc-realtime>
        <gc-realtime id="velocity" label="Velocity" value=0.000 unit="mm/min" decimals=3 componentIdentifier="velocity"></gc-realtime>
        <div id="message" style="font-size:16px;"></div>
         
            <ul id="realtimeUpdates" class="w3-ul">
                <li><input id="targetPressureField" type="number" class="w3-input w3-medium"></input></li>
            </ul>
            <div class="realtime-controls">
                <div class="control-bar btn-group">
                    <button id="startTestBtn" class="w3-button control-button">START<br>TEST</button>
                    <button id="tareBtn"      class="w3-button control-button">TARE</button>
                    <button id="stopTestBtn"  class="w3-button control-button">STOP<br>TEST</button>
                </div>      
            </div>
            <gc-pump-control id= "pumpControl"></gc-pump-control>
            <slot></slot>
        </div>        
    </div>
  </div>
`;

class GCDataUnit extends HTMLElement {
    static get observedAttributes() {
        return ["title", "componentIdentifier"];
    }

    constructor() {
        super();
        const root = this.attachShadow({ mode: "open" });
        root.append(template.content.cloneNode(true));
        this.titleElement = root.getElementById("title");
        this.componentIdentifier = this.getAttribute("componentIdentifier") || "DataUnit";

        this.onLanguageChange = this.onLanguageChange.bind(this);

        this.usbButton = null;
        this.onTransportLog = this.onTransportLog.bind(this);
        this.onTransportStatus = this.onTransportStatus.bind(this);
        this.onTransportSerialLine = this.onTransportSerialLine.bind(this);
        this.toggleUsbConnection = this.toggleUsbConnection.bind(this);

        this.bleButton = null;
        this.batteryIcon = null;
        this.toggleBleConnection = this.toggleBleConnection.bind(this);
        this.transportService = null;
        this.transportInitialized = false;
        this.appStore = null;
        this.onProcedureStoreChange = this.onProcedureStoreChange.bind(this);

        this.message = root.getElementById("message");
        this.startTestButton = root.getElementById("startTestBtn");
        this.stopTestButton = root.getElementById("stopTestBtn");
        this.onStartTest = this.onStartTest.bind(this);
        this.onStopTest = this.onStopTest.bind(this);
        this.procedureController = new TestProcedureController();
        this.onProcedureCommandRequested = this.onProcedureCommandRequested.bind(this);
        this.onProcedureStatus = this.onProcedureStatus.bind(this);
        this.onProcedureStepStarted = this.onProcedureStepStarted.bind(this);
        this.onProcedureTargetRequested = this.onProcedureTargetRequested.bind(this);
        this.onProcedureMeasurementComplete = this.onProcedureMeasurementComplete.bind(this);
        this.onProcedureComplete = this.onProcedureComplete.bind(this);
        this.onDistanceResetRequested = this.onDistanceResetRequested.bind(this);
        const historySize = 20;
        const obs = {};
        obs.z = 0.0; obs.t = 0;
        this.history = new Array(historySize).fill(obs);
        this.velocity = 0.0;

        this.targetPressureElement = root.getElementById("targetPressure");
        this.pressureElement = root.getElementById("pressure");
        this.forceElement = root.getElementById("force");
        this.distanceElement = root.getElementById("distance");
        this.velocityElement = root.getElementById("velocity");
        this.pumpControlElement = root.getElementById("pumpControl");

        // Temporarily used to set targetPressure, will be removed....
        this.targetPressureField = root.getElementById("targetPressureField");
        this.targetPressureField.addEventListener('change', (ev) => {
            this.targetPressure = this.targetPressureField.value;
            let cmdMsg = `pump:target=${this.targetPressure}`;
            this.sendCmd(cmdMsg);
            this.message.textContent = `REQUEST ${this.targetPressure} kPa`;
        });

   }

    setTransportService(transportService) {
        if (!(transportService instanceof TransportService)) {
            throw new TypeError("transportService must be a TransportService");
        }
        if (this.transportInitialized) {
            throw new Error("TransportService cannot be replaced after initialization");
        }
        this.transportService = transportService;
        this.pumpControlElement.setTransportService(transportService);
    }

    setConnectionControls({ usbButton = null, bleButton = null, batteryIcon = null } = {}) {
        this.usbButton?.removeEventListener("click", this.toggleUsbConnection);
        this.bleButton?.removeEventListener("click", this.toggleBleConnection);
        this.usbButton = usbButton;
        this.bleButton = bleButton;
        this.batteryIcon = batteryIcon;
        if (this.isConnected) {
            this.usbButton?.addEventListener("click", this.toggleUsbConnection);
            this.bleButton?.addEventListener("click", this.toggleBleConnection);
        }
    }

    setAppStore(appStore) {
        if (!appStore || typeof appStore.getProcedure !== "function") {
            throw new TypeError("appStore must provide getProcedure()");
        }
        this.appStore = appStore;
        if (this.isConnected) {
            this.appStore.addEventListener("procedure-changed", this.onProcedureStoreChange);
            this.syncProcedureFromStore();
        }
    }

    connectedCallback() {
        document.addEventListener("new-language-selected", this.onLanguageChange);
        this.appStore?.addEventListener("procedure-changed", this.onProcedureStoreChange);
        this.syncProcedureFromStore();
        this.startTestButton.addEventListener("click", this.onStartTest);
        this.stopTestButton.addEventListener("click", this.onStopTest);
        this.procedureController.addEventListener("command-requested", this.onProcedureCommandRequested);
        this.procedureController.addEventListener("status", this.onProcedureStatus);
        this.procedureController.addEventListener("step-started", this.onProcedureStepStarted);
        this.procedureController.addEventListener("target-requested", this.onProcedureTargetRequested);
        this.procedureController.addEventListener("measurement-complete", this.onProcedureMeasurementComplete);
        this.procedureController.addEventListener("procedure-complete", this.onProcedureComplete);
        this.procedureController.addEventListener("distance-reset-requested", this.onDistanceResetRequested);

        this.usbButton?.addEventListener("click", this.toggleUsbConnection);
        this.bleButton?.addEventListener("click", this.toggleBleConnection);
    queueMicrotask(() => this.initializeTransportService());

        this.targetPressure = 0.0;
        this.render();
    }

    disconnectedCallback() {
        document.removeEventListener("new-language-selected", this.onLanguageChange);
        this.appStore?.removeEventListener("procedure-changed", this.onProcedureStoreChange);
        this.startTestButton.removeEventListener("click", this.onStartTest);
        this.stopTestButton.removeEventListener("click", this.onStopTest);
        this.procedureController.removeEventListener("command-requested", this.onProcedureCommandRequested);
        this.procedureController.removeEventListener("status", this.onProcedureStatus);
        this.procedureController.removeEventListener("step-started", this.onProcedureStepStarted);
        this.procedureController.removeEventListener("target-requested", this.onProcedureTargetRequested);
        this.procedureController.removeEventListener("measurement-complete", this.onProcedureMeasurementComplete);
        this.procedureController.removeEventListener("procedure-complete", this.onProcedureComplete);
        this.procedureController.removeEventListener("distance-reset-requested", this.onDistanceResetRequested);

        this.usbButton?.removeEventListener("click", this.toggleUsbConnection);
        this.bleButton?.removeEventListener("click", this.toggleBleConnection);
        if (this.transportInitialized) {
            this.transportService.removeEventListener("app-log", this.onTransportLog);
            this.transportService.removeEventListener("port-status-change", this.onTransportStatus);
            this.transportService.removeEventListener("serial-line", this.onTransportSerialLine);
            this.transportService.stop();
            this.transportInitialized = false;
        }
    }

    initializeTransportService() {
        if (!this.isConnected || this.transportInitialized) {
            return;
        }
        if (!this.transportService) {
            const usbLink = new GcUsbLink({
                componentIdentifier: this.componentIdentifier,
                storageScope: this.id || this.componentIdentifier || "default",
            });
            const bleLink = new GcBleLink({
                componentIdentifier: this.componentIdentifier,
                serviceUuid: "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
            });
            this.transportService = new TransportService({
                transports: { usb: usbLink, ble: bleLink },
            });
            this.pumpControlElement.setTransportService(this.transportService);
        }

        this.transportService.addEventListener("app-log", this.onTransportLog);
        this.transportService.addEventListener("port-status-change", this.onTransportStatus);
        this.transportService.addEventListener("serial-line", this.onTransportSerialLine);
        this.transportService.start();
        this.transportService.enableAutoConnect("usb");
        this.transportInitialized = true;
    }

    setBatteryState(voltage, batteryLevel) {
        //        console.log(`Set battery ${voltage} volt, level ${batteryLevel}`);
        const batt = this.batteryIcon;
        if (!batt) {
            return;
        }
        batt.classList.remove("fa-battery-0");
        batt.classList.remove("fa-battery-1");
        batt.classList.remove("fa-battery-2");
        batt.classList.remove("fa-battery-3");
        batt.classList.add(`fa-battery-${batteryLevel}`);
        batt.title = `Batt ${voltage} V`;
    }

    toggleUsbConnection() {
        if (this.transportService.getStatus("usb").state === "connected") {
            this.transportService.disconnect("usb");
        } else {
            this.transportService.connect("usb");
        }
    }

    toggleBleConnection() {
        if (this.transportService.getStatus("ble").state === "connected") {
            this.transportService.disconnect("ble");
        }
        else {
            this.transportService.connect("ble");
        }
    }


    getJsObject(inputLine, updateGUI) {
        const args = String(inputLine || "").trim().split(",");
        var result = '{';
        var found = 0;
        //example of inputLine $GC_L,I,ps:0,tp:0.0,p:0.01,z:0.2,v:6.429,vmax:0.000,ok:0
        for (let t = 0; t < args.length; t++) {
            const prop = args[t];
            let colon = prop.indexOf(':');
            let key = prop;
            let value = '';
            if (colon != -1) {

                key = prop.substring(0, colon);
                value = prop.substring(colon + 1);
                let insert = `\"${key}\": ${value}`;
                if (found == 0)
                    result += insert;
                else
                    result += ',' + insert;
                found++;
                if (updateGUI) {
                    let el = this.shadowRoot.getElementById(key);
                    if (el != null) el.textContent = value;
                }
            }
        }
        result += '}';
        try {
            return JSON.parse(result);
        } catch (error) {
            return null;
        }
    }

    addNewDistanceToHistory(newDistance) {
        let MAX_HISTORY = this.history.length;
        for (let i = MAX_HISTORY - 1; i > 0; i--) {
            this.history[i] = this.history[i - 1];
        }
        const newObs = {};
        newObs.z = newDistance; newObs.t = Date.now();
        this.history[0] = newObs;
        let dz = this.history[0].z - this.history[MAX_HISTORY - 1].z;
        let dt = this.history[0].t - this.history[MAX_HISTORY - 1].t;
        if (dt > 0) {
            this.velocity = (60000.0 * dz) / dt; // mm/min
        }
        this.velocity = Math.round(this.velocity * 1000) / 1000.0;
        return this.velocity;
    }


    // This method is called when a new line of text is received either via USB or BLE
    processIncomingLine(textLine) {
        let inp = String(textLine);
        if (inp.startsWith('$F,')) {
            // $F,h:0,f:1492,z:7986
            let fast = this.getJsObject(textLine, false);
            if (fast === null) return;
            let pressure = (fast.p / 100.0);
            let force = (fast.f / 100.0);
            let distance = (fast.z / 1000.0);
            this.pressureElement.value = pressure;
            this.forceElement.value = force;
            this.distanceElement.value = distance;
            let now = Date.now();
            if (now - this.history[0].t >= 500.0) { // add to history at 2Hz                
                this.velocityElement.value = this.addNewDistanceToHistory(distance);
            }
            this.pumpControlElement.pumpState = fast.h;
                this.procedureController.recordFastMeasurement({ pressure, force, distance, velocity: this.velocity });
        }
        else
            if (inp.startsWith("$GC_BATT,")) {
                //$GC_BATT,voltage:19.9,level:3
                let batt = this.getJsObject(textLine, true);
                if (batt == null) return;
                this.setBatteryState(batt.voltage, batt.level);
            }
            else
                if (inp.startsWith("$REQUESTED,target")) {
                    //"$REQUESTED,target:%.2f,auto:%d
                    let requested = this.getJsObject(textLine, true);
                    if (requested == null) return;
                    this.targetPressureElement.value = requested.target;
                    this.procedureController.recordTargetRequested(requested.target);
                }
                else
                    if (inp.startsWith("$REACHED,target")) {
                        //"$REACHED,target:%.2f,p:%.2f,f:%.2f,z:%.3f",
                        let reached = this.getJsObject(textLine, true);
                        if (reached == null) return;
                        this.targetPressureElement.value = reached.target;
                        this.procedureController.recordTargetReached({
                            targetPressure: reached.target,
                            pressure: reached.p,
                            force: reached.f,
                            distance: reached.z,
                        });
                    }
    }

    attributeChangedCallback() {
        this.componentIdentifier = this.getAttribute("componentIdentifier") || "DataUnit";
        this.transportService?.getTransport("usb").configure?.({
            componentIdentifier: this.componentIdentifier,
            storageScope: this.id || this.componentIdentifier || "default",
        });
        this.render();
    }

    onProcedureStoreChange(event) {
        this.procedureController.setProcedure(event.detail.procedure);
    }

    syncProcedureFromStore() {
        const procedure = this.appStore?.getProcedure();
        if (procedure) {
            this.procedureController.setProcedure(procedure);
        }
    }

    async onStartTest() {
        this.startTestButton.disabled = true;
        try {
            if (!this.procedureController.procedure) {
                const url = `${import.meta.env.BASE_URL}test_procedures/R211_2.2.4.json`;
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Unable to load procedure (${response.status})`);
                }
                this.procedureController.setProcedure(await response.json());
            }
            this.procedureController.start();
        } catch (error) {
            this.startTestButton.disabled = false;
            this.message.textContent = `TEST START FAILED: ${error.message}`;
            this.emitAppLog("error", error.message);
        }
    }

    onStopTest() {
        this.procedureController.stop();
        this.startTestButton.disabled = false;
    }

    onProcedureCommandRequested(event) {
        event.detail.accepted = this.sendCmd(event.detail.command);
    }

    onProcedureStatus(event) {
        this.message.textContent = event.detail.message;
    }

    onProcedureStepStarted(event) {
        this.targetPressure = event.detail.step.targetPressure;
        this.targetPressureField.value = event.detail.step.targetPressure;
    }

    onProcedureTargetRequested(event) {
        this.targetPressureField.value = event.detail.targetPressure;
    }

    onProcedureMeasurementComplete(event) {
        if (!this.appStore?.addMeasurement) {
            throw new Error("Data unit requires an appStore to record measurements");
        }
        this.appStore.addMeasurement(event.detail.measurement);
    }

    onProcedureComplete() {
        this.startTestButton.disabled = false;
    }

    onDistanceResetRequested() {
        const obs = { z: 0.0, t: 0 };
        this.history.fill(obs);
    }


    onTransportLog(event) {
        const detail = event?.detail || {};
        const level = detail.level || "info";
        const source = detail.source || detail.transport || "Transport";
        const message = detail.message || "(no message)";

        this.emitAppLog(level, `[${source}] ${message}`);
    }

    onTransportStatus(event) {
        const transport = event?.detail?.transport;
        const state = event?.detail?.state;
        const button = transport === "usb" ? this.usbButton : transport === "ble" ? this.bleButton : null;
        if (!button || !state) {
            return;
        }

        button.style.color = state === "connected" ? "green" : "black";
        if (state === "connected") {
            this.sendCmd("du:batt?", { target: transport });
        }
    }

    sendCmd(messageToSend, options = {}) {
        return this.transportService.sendCommand(messageToSend, options);
    }

    onTransportSerialLine(event) {
        const line = event?.detail?.line;
        if (typeof line === "string") {
            const normalizedLine = line.trim();
            if (normalizedLine.startsWith("$")) {
                this.processIncomingLine(normalizedLine);
            }
            else {
                this.emitAppLog("debug", `RX line: ${normalizedLine}`);
            }
        }
    }

    async onLanguageChange(event) {
        const detail = event?.detail;
        const requestedCode = typeof detail === "string" ? detail : detail?.code;
        const languageCatalog = detail?.catalog;
        if (languageCatalog) {
            if(this.titleElement!=null) {
                const titleText = languageCatalog?.[this.componentIdentifier]?.title || "Data Unit";
                this.titleElement.textContent = titleText;
            }
            let elements = [
                this.targetPressureElement,
                this.pressureElement,
                this.forceElement,
                this.distanceElement,
                this.velocityElement
            ];
            let prop = languageCatalog?.[this.componentIdentifier].properties;
            for(let v=0;v<prop.length;v++) {
                let rec = prop[v];
                elements.forEach(element => {
                    if(element.componentIdentifier===rec.key) {
                       element.updateComponent(rec);
                    }
                });
            }
        }
    }


    addTrace(direction, text) {
        let level = "debug";
        if (direction === "ERR") {
            level = "error";
        }
        this.emitAppLog(level, `${direction}: ${text}`);
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

    

    render() {
        if(this.titleElement!=null)
            this.titleElement.textContent = this.getAttribute("title") || "DU";
    }

    parseNumber(value) {
        const numeric = Number.parseFloat(value);
        return Number.isFinite(numeric) ? numeric : null;
    }

    formatMetric(value, decimals, fallbackValue) {
        return value == null ? fallbackValue : value.toFixed(decimals);
    }

}

customElements.define("gc-dataunit", GCDataUnit);

export { GCDataUnit };