
import w3_css from "./w3.css?inline";
import { GcUsbLink } from "./gc-usblink.js";
import { GcBleLink } from "./gc-blelink.js";
import { GCProcedureBar } from "./gc-procedure-bar.js";
import { GCRealtime } from "./gc-realtime.js";
import { GCPumpControl } from "./gc-pump-control.js";

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

const Phases = {
    IDLE: 0,
    WAIT_FOR_TARGET_PRESSURE: 1,
    EVALUATE_Z_SPEED: 2,
    EVALUATION_PASSED: 3,
    EVALUATION_FAILED: 4,
    TEST_COMPLETED: 5
}

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

        this.usbButton = document.getElementById("usbButton");
        this.onUsbLinkLog = this.onUsbLinkLog.bind(this);
        this.onUsbLinkStatus = this.onUsbLinkStatus.bind(this);
        this.onUsbSerialLine = this.onUsbSerialLine.bind(this);
        this.toggleUsbConnection = this.toggleUsbConnection.bind(this);

        this.bleButton = document.getElementById("bleButton");
        this.onBleLinkLog = this.onBleLinkLog.bind(this);
        this.onBleLinkStatus = this.onBleLinkStatus.bind(this);
        this.onBleSerialLine = this.onBleSerialLine.bind(this);
        this.toggleBleConnection = this.toggleBleConnection.bind(this);


        this.usbLink = new GcUsbLink({
            componentIdentifier: this.componentIdentifier,
            storageScope: this.id || this.componentIdentifier || "default",
        });

        this.bleLink = new GcBleLink({
            componentIdentifier: this.componentIdentifier,
            serviceUuid: "6e400001-b5a3-f393-e0a9-e50e24dcca9e", //"00005501-d102-11e1-9b23-00025b00a5a5",
        });

        this.message = root.getElementById("message");
        const historySize = 20;
        const nowMs = Date.now();
        const obs = {};
        obs.z = 0.0; obs.t = 0;
        this.history = new Array(historySize).fill(obs);
        this.phase = Phases.IDLE;
        // We fill the testResult during a test
        const testResult = {};
        testResult.nr   = 1;
        testResult.name ="Forbelastning";
        testResult.targetPressure = 0.0;    // The pressure we wanted to have tested
        testResult.pressure = 0.0;          // Actual pressure at t0
        testResult.force = 0.0;          // Force applied to pressure plate
        testResult.distance = 0.0;          // Ground z-distance at t0
        testResult.velocity = 0.0;          // Settling speed at end of test in mm/min
        testResult.vMax = 0.02;         // Max accepatble ground speed.
        testResult.dt = 0;            // Duration of test evaluation in seconds
        testResult.tMax = 60;           // Max duration of evaluatiuon period in seconds
        testResult.hhmmss = "00:00:00";   // Clock at start of test
        testResult.passed = false;        // Is ground speed below threshold

        this.testResult = testResult;
        this.deltaPressure = 0;
        this.currentPressure = 0;
        this.currentTarget = 0;
        this.velocity = 0.0;
        this.vMax = 0.02;
        this.secondsElapsed = 0;
        this.tMax = 60;
        this.nextStateMachineUpdate = Date.now() + 1000;
        this.secondsPause = 0;

        this.nyTargetPressureElement = root.getElementById("targetPressure");
        this.nyPressureElement = root.getElementById("pressure");
        this.nyForceElement = root.getElementById("force");
        this.nyDistanceElement = root.getElementById("distance");
        this.nyVelocityElement = root.getElementById("velocity");
        this.pumpControlElement = root.getElementById("pumpControl");

        // Temporarily used to set targetPressure, will be removed....
        this.targetPressureField = root.getElementById("targetPressureField");
        this.targetPressureField.addEventListener('change', (ev) => {
            this.targetPressure = this.targetPressureField.value;
            let cmdMsg = `pump:target=${this.targetPressure}`;
            this.sendCmd(cmdMsg);
            this.message.textContent = `REQUEST ${this.targetPressure} kPa`;
            this.secondsPause = 2;
        });

   }

    connectedCallback() {

        document.addEventListener("app-language-change", this.onLanguageChange);

        this.usbButton.addEventListener("click", this.toggleUsbConnection);
        this.usbLink.addEventListener("app-log", this.onUsbLinkLog);
        this.usbLink.addEventListener("port-status-change", this.onUsbLinkStatus);
        this.usbLink.addEventListener("serial-line", this.onUsbSerialLine);
        this.usbLink.startMonitoring();
        this.usbLink.enableAutoConnect();


        this.bleButton.addEventListener("click", this.toggleBleConnection);
        this.bleLink.addEventListener("app-log", this.onUsbLinkLog);
        this.bleLink.addEventListener("port-status-change", this.onBleLinkStatus);
        this.bleLink.addEventListener("serial-line", this.onBleSerialLine);
        this.bleLink.startMonitoring();

        this.targetPressure = 0.0;
        this.render();
    }

    disconnectedCallback() {
        document.removeEventListener("app-language-change", this.onLanguageChange);

        this.usbButton.removeEventListener("click", this.toggleUsbConnection);
        this.usbLink.removeEventListener("app-log", this.onUsbLinkLog);
        this.usbLink.removeEventListener("port-status-change", this.onUsbLinkStatus);
        this.usbLink.removeEventListener("serial-line", this.onUsbSerialLine);
        this.usbLink.stopMonitoring();
        this.usbLink.disconnectPort({ intentional: true });

        this.bleButton.removeEventListener("click", this.toggleBleConnection);
        this.bleLink.removeEventListener("port-status-change", this.onBleLinkStatus);
        this.bleLink.removeEventListener("serial-line", this.onBleSerialLine);
        this.bleLink.stopMonitoring();
        this.bleLink.disconnectPort({ intentional: true });
    }

    setBatteryState(voltage, batteryLevel) {
        //        console.log(`Set battery ${voltage} volt, level ${batteryLevel}`);
        var batt = document.getElementById("batteryIcon");
        batt.classList.remove("fa-battery-0");
        batt.classList.remove("fa-battery-1");
        batt.classList.remove("fa-battery-2");
        batt.classList.remove("fa-battery-3");
        batt.classList.add(`fa-battery-${batteryLevel}`);
        batt.title = `Batt ${voltage} V`;
    }

    toggleUsbConnection() {
        if (this.usbLink.getPortStatus().state === "connected") {
            this.usbLink.disconnectPort({ intentional: true });
        } else {
            this.usbLink.connectPort();
        }
    }

    toggleBleConnection() {
        if (this.bleLink.getPortStatus().state === 'connected') {
            this.bleLink.disconnectPort({ intentional: true });
        }
        else {
            this.bleLink.connectPort();
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


    updateStateMachine() {
        let mess = "";
        if (Date.now() < this.nextStateMachineUpdate) return;
        this.nextStateMachineUpdate = Date.now() + 1000;
        if (this.secondsPause > 0) {
            this.secondsPause--;
            return;
        }
        switch (this.phase) {
            case Phases.IDLE:

                break;
            case Phases.WAIT_FOR_TARGET_PRESSURE:
                if (this.targetPressureReached) {
                    mess = `TARGET PRESSURE REACHED`;
                    this.message.textContent = mess;
                    this.phase = Phases.EVALUATE_Z_SPEED;
                    this.testResult.hhmmss = new Date().toLocaleTimeString('en-GB');
                    this.secondsElapsed = 0;
                    this.secondsPause = 1;
                }
                break;
            case Phases.EVALUATE_Z_SPEED:
                this.testResult.velocity = this.velocity;
                this.testResult.dt = this.secondsElapsed;
//                if(this.currentPressure>this.testResult.pressure)this.testResult.pressure= this.currentPressure;
                mess = `EVAL v = ${this.velocity.toFixed(3)} mm/min [${this.secondsElapsed}/${this.tMax}]`;
                this.message.textContent = mess;
                if (Math.abs(this.velocity) < this.vMax)
                    this.phase = Phases.EVALUATION_PASSED;
                if (this.secondsElapsed >= this.tMax)
                    this.phase = Phases.EVALUATION_FAILED;
                this.secondsElapsed++;
                break;
            case Phases.EVALUATION_PASSED:
                // PUBLISH TEST CONCLUSION PASSED
                this.testResult.velocity = this.velocity;
                this.testResult.dt = this.secondsElapsed;
                this.testResult.passed = true;
                this.emitTestMeasurement("new-measurement", this.testResult);
                console.log(this.testResult);
                mess = `PASS v = ${this.velocity.toFixed(3)} < ${this.vMax} mm/min after ${this.secondsElapsed} s`;
                this.message.textContent = mess;
                this.phase = Phases.TEST_COMPLETED;
                this.secondsPause = 4;
                break;
            case Phases.EVALUATION_FAILED:
                // PUBLISH TEST CONCLUSION FAILED
                this.testResult.velocity = this.velocity;
                this.testResult.dt = this.secondsElapsed;
                this.testResult.passed = false;
                this.emitTestMeasurement("new-measurement", this.testResult);
                console.log(this.testResult);
                mess = `FAIL v = ${this.velocity.toFixed(3)} > ${this.vMax} mm/min after ${this.secondsElapsed} s`;
                this.message.textContent = mess;
                this.phase = Phases.TEST_COMPLETED;
                this.secondsPause = 4;
                break;
            case Phases.TEST_COMPLETED:
                // UPDATE CONCLUSION
                this.phase = Phases.IDLE;
                this.targetPressureReached = false;
                this.message.textContent = "TEST COMPLETED";
                this.secondsPause = 2;
                break;
        }
    }

    // This method is called when a new line of text is received either via USB or BLE
    processIncomingLine(textLine) {
        let inp = String(textLine);
        if (inp.startsWith('$F,')) {
            // $F,h:0,f:1492,z:7986
            let fast = this.getJsObject(textLine, false);
            if (fast === null) return;
            //this.deltaPressure = (this.targetPressure - this.currentPressure);
            let pressure = (fast.p / 100.0);
            let force = (fast.f / 100.0);
            let distance = (fast.z / 1000.0);
            this.nyPressureElement.value = pressure;
            this.nyForceElement.value = force;
            this.nyDistanceElement.value = distance;
            let now = Date.now();
            if (now - this.history[0].t >= 500.0) { // add to history at 2Hz                
                this.nyVelocityElement.value = this.addNewDistanceToHistory(distance);
            }
            this.pumpControlElement.pumpState = fast.h;
            if(this.phase==Phases.EVALUATE_Z_SPEED) {
               // We want the peak pressure recorded as testResult.pressure
               if(pressure>this.testResult.pressure) this.testResult.pressure= pressure;
            }
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
                    this.testResult.targetPressure = requested.target;
                    this.nyTargetPressureElement.value = requested.target;
                    this.testResult.dt = 0;
                    this.targetPressureField.value = this.testResult.targetPressure;
                    this.phase = Phases.WAIT_FOR_TARGET_PRESSURE;
                }
                else
                    if (inp.startsWith("$REACHED,target")) {
                        //"$REACHED,target:%.2f,p:%.2f,f:%.2f,z:%.3f",
                        let reached = this.getJsObject(textLine, true);
                        if (reached == null) return;
                        this.testResult.targetPressure = reached.target;
                        this.nyTargetPressureElement.value = reached.target;
                        this.testResult.pressure = reached.p;
                        this.testResult.force = reached.f;
                        this.testResult.distance = reached.z;
                        this.targetPressureReached = true;
                    }
        this.updateStateMachine();

    }

    attributeChangedCallback() {
        this.componentIdentifier = this.getAttribute("componentIdentifier") || "DataUnit";
        this.usbLink.configure({
            componentIdentifier: this.componentIdentifier,
            storageScope: this.id || this.componentIdentifier || "default",
        });
        this.render();
    }


    onUsbLinkLog(event) {
        const detail = event?.detail || {};
        const level = detail.level || "info";
        const source = detail.source || "UsbLink";
        const message = detail.message || "(no message)";

        // Re-emit from this host element so bubbles/composed can reach document listeners.
        this.emitAppLog(level, `[${source}] ${message}`);
    }

    onUsbLinkStatus(event) {
        const state = event?.detail?.state;
        if (state) {
            if (state === "connected") {
                this.usbButton.style.color = "green";
                this.sendCmd("du:batt?", { target: "usb" });
            } else {
                this.usbButton.style.color = "black";
            }
        }
    }

    onBleLinkLog(event) {
        const detail = event?.detail || {};
        const level = detail.level || "info";
        const source = detail.source || "BleLink";
        const message = detail.message || "(no message)";

        // Re-emit from this host element so bubbles/composed can reach document listeners.
        this.emitAppLog(level, `[${source}] ${message}`);
    }

    resolveSendTarget(requestedTarget = "auto") {
        const normalized = String(requestedTarget || "auto").trim().toLowerCase();
        if (normalized === "usb" || normalized === "ble" || normalized === "any" || normalized === "both" || normalized === "all") {
            return normalized;
        }

        if (this.usbLink?.linkState === "connected") {
            return "usb";
        }

        if (this.bleLink?.linkState === "connected") {
            return "ble";
        }

        return "any";
    }

    dispatchSendCmdEvent(textLine, options = {}) {
        const normalizedText = typeof textLine === "string" ? textLine.trim() : "";
        if (!normalizedText) {
            return false;
        }

        const target = this.resolveSendTarget(options.target);
        document.dispatchEvent(
            new CustomEvent("gc-send-cmd", {
                detail: {
                    textLine: normalizedText,
                    target,
                    componentIdentifier: this.componentIdentifier,
                },
            }),
        );
        return true;
    }

    sendCmd(messageToSend, options = {}) {
        return this.dispatchSendCmdEvent(messageToSend, options);
    }

    onBleLinkStatus(event) {
        const state = event?.detail?.state;
        if (state) {
            if (state === "connected") {
                this.bleButton.style.color = "green";
                this.sendCmd("du:batt?", { target: "ble" });
            } else {
                this.bleButton.style.color = "black";
            }
        }
    }

    onUsbSerialLine(event) {
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

    onBleSerialLine(event) {
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

    emitTestMeasurement(action, measurement, meta = {}) {
        this.dispatchEvent(
            new CustomEvent("test-measurement", {
                detail: {
                    action,
                    source: this.id || this.tagName.toLowerCase(),
                    measurement,
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