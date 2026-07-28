
import w3_css from "./w3.css?inline";
import { GcUsbLink } from "./gc-usblink.js";
import { GcBleLink } from "./gc-blelink.js";

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
  font-size:24px;
}

.pump-control-bar .pump-control-button:first-child {
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
}

.pump-control-bar .pump-control-button:last-child {
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
}

.pump-control-button.is-active {
  background-color: #2196f3 !important;
  border-color: #0f4e82;
  box-shadow: inset 0 0 0 1px #0f4e82;
}

       
  </style>

  <div class="w3-container w3-margin-bottom">
    <div class="body">
        <h2 id="title" class="w3-center w3-text-blue w3-medium w3-left">Component Name</h2>    
        <div class="w3-container w3-padding">
            <ul id="realtimeUpdates" class="w3-ul">
                <li><input id="tp" type="number" class="w3-input w3-medium"></input></li>
                <li id="dp"></li>
                <li id="p"></li>
                <li id="f"></li>
                <li id="z"></li>
                <li id="v"></li>
                <li id="message" style="font-size:16px;"></li>
            </ul>
            <div class="realtime-pump-controls">
                <div class="pump-control-bar btn-group">
                    <button id="upBtn"   class="w3-button pump-control-button">⇑</button>
                    <button id="stopBtn" class="w3-button pump-control-button">⏹︎</button>
                    <button id="dnBtn"   class="w3-button pump-control-button">⇓</button>
                </div>      
            </div>
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

        this.dp = root.getElementById("dp");
        this.message = root.getElementById("message");

        this.setPumpState = this.setPumpState.bind(this);

        this.stopButton = root.getElementById("stopBtn");
        this.upButton = root.getElementById("upBtn");
        this.dnButton = root.getElementById("dnBtn");
        
        this.stopButton.addEventListener('click', (ev) => {
            this.setPumpState(0);
        }  );
        this.upButton.addEventListener('click', (ev) => {
            this.setPumpState(1);
        }  );
        this.dnButton.addEventListener('click', (ev) => {
            this.setPumpState(2);
        }  );
        this.targetPressureField = root.getElementById("tp");
        this.targetPressureField.addEventListener('change', (ev) => {
            let targetPressure = this.targetPressureField.value;
            let targetForce    = this.getForceFromPressure(targetPressure,0.300);
            let cmdMsg = "pump:target="+targetForce.toFixed(2);
            this.message.textContent = 'Sending '+cmdMsg;
            this.sendCmd(cmdMsg);
        }  );

        const historySize = 20;
        const nowMs = Date.now();
        const obs= {};
        obs.z = 0.0; obs.t = 0;
        this.history = new Array(historySize).fill(obs);
    }

    connectedCallback() {

        document.addEventListener("app-language-change", this.onLanguageChange);

        this.usbButton.addEventListener("click", this.toggleUsbConnection);
        this.usbLink.addEventListener("app-log", this.onUsbLinkLog);
        this.usbLink.addEventListener("port-status-change", this.onUsbLinkStatus);
        this.usbLink.addEventListener("serial-line", this.onUsbSerialLine);
        this.usbLink.startMonitoring();


        this.bleButton.addEventListener("click", this.toggleBleConnection);
        this.bleLink.addEventListener("app-log", this.onUsbLinkLog);
        this.bleLink.addEventListener("port-status-change", this.onBleLinkStatus);
        this.bleLink.addEventListener("serial-line", this.onBleSerialLine);
        this.bleLink.startMonitoring();

        this.setPumpState(0);
        this.render();
    }

    setPumpState(pumpState) {
        this.upButton.classList.remove('is-active');
        this.dnButton.classList.remove('is-active');
        this.stopButton.classList.remove('is-active');
        if(pumpState==0) {
           this.stopButton.classList.add('is-active');
        }
        if(pumpState==1) {
           this.upButton.classList.add('is-active');
        }
        if(pumpState==2) {
           this.dnButton.classList.add('is-active');
        }
        this.render();
    }

    setBatteryState(voltage,batteryLevel) {
//        console.log(`Set battery ${voltage} volt, level ${batteryLevel}`);
        var batt= document.getElementById("batteryIcon");
        batt.classList.remove("fa-battery-0");
        batt.classList.remove("fa-battery-1");
        batt.classList.remove("fa-battery-2");
        batt.classList.remove("fa-battery-3");
        batt.classList.add(`fa-battery-${batteryLevel}`);
        batt.title=`Batt ${voltage} V`;
        this.render();
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
        //    $GC_L,I,ps:0,tp:0.0,p:0.01,z:0.2,v:6.429,vmax:0.000,ok:0
        for(let t=0;t<args.length;t++) {
            const prop = args[t];
            let colon = prop.indexOf(':');
            let key = prop;
            let value = '';
            if(colon!=-1) { 
                
                key = prop.substring(0,colon);
                value = prop.substring(colon+1);
                let insert = `\"${key}\": ${value}`;
                if(found==0)                    
                    result+= insert;
                else
                    result+= ','+ insert;
                found++;
                if(updateGUI) {
                    let el = this.shadowRoot.getElementById(key);
                    if(el!=null) el.textContent = value;
                }
            }
        }
        result+='}';
        try {
            return JSON.parse(result);
        } catch (error) {
            return null;
        }
    }

    getPressureFromForce(force, plateDiameter) {
        let A = Math.PI * (plateDiameter*plateDiameter)/4.0;
        if(A==0) return 0.0;
        return force/A;
    }
    getForceFromPressure(pressure, plateDiameter) {
        let A = Math.PI * (plateDiameter*plateDiameter)/4.0;
        return pressure*A;
    }

    addNewDistanceToHistory(newDistance) {
       let MAX_HISTORY = this.history.length;
       for (let i = MAX_HISTORY - 1; i > 0; i--)
        {
            this.history[i]  = this.history[i-1];
        }
        const newObs= {};
        newObs.z = newDistance; newObs.t = Date.now();
        this.history[0] = newObs;
        let dz = this.history[0].z - this.history[MAX_HISTORY - 1].z;
        let dt = this.history[0].t - this.history[MAX_HISTORY - 1].t;
        let tipSpeed = 0.0;
        if (dt > 0)
        {
            tipSpeed = (60000.0 * dz) / dt; // mm/min
        }        
        return tipSpeed;
    }

    // This method is called when a new line of text is received either via USB or BLE
    processIncomingLine(textLine) {
        let inp = String(textLine);
        if(inp.startsWith('$F,')){
            // $F,h:0,f:1492,z:7986
            let fast = this.getJsObject(textLine,false);
            if(fast===null) return;
            let force = (fast.f/100.0);
            let distance = (fast.z/1000.0);
            let pressure = this.getPressureFromForce(force,0.300);
            this.shadowRoot.getElementById('p').textContent = pressure.toFixed(1);
            this.shadowRoot.getElementById('f').textContent = force.toFixed(2);
            this.shadowRoot.getElementById('z').textContent = distance.toFixed(3);
            let now = Date.now();
            if(now-this.history[0].t >=500.0) {
                let v = this.addNewDistanceToHistory(distance);
                this.shadowRoot.getElementById('v').textContent = v.toFixed(3);
            }
            this.setPumpState(fast.h);
            let dt = this.history[0].t - this.history[this.history.length - 1].t;
            if(dt>0) {
                let hz = (this.history.length*1000.0) / dt;
                this.shadowRoot.getElementById('dp').textContent = hz.toFixed(2);
            }
        } 
        else 
        if(inp.startsWith('$GC_L,')){
            let live = this.getJsObject(textLine,true);
            let el = this.shadowRoot.getElementById('dp');
            if(el!=null) el.textContent = (live.tp-live.p).toFixed(1);;
        } 
        else
        if (inp.startsWith("$GC_FORCE_TARGET,")) {
            let result = this.getJsObject(textLine,true);            
            result.p   = this.getPressureFromForce(result.f,0.300);
            this.message.textContent = `Reached f=`+result.f.toFixed(2)+'kN, p='+result.p.toFixed(1)+'kPa, z='+result.z.toFixed(3)+'mm';
        }
        else
        if (inp.startsWith("$GC_T,")) {
            let target = this.getJsObject(textLine,true);            
            let el = this.shadowRoot.getElementById('dp');
            if(el!=null) el.textContent = (target.tp-target.p).toFixed(1);
            this.message.textContent = `Adjust pressure to `+target.tp+' kPa';
        }
        else
        if (inp.startsWith("$GC_BATT,")) {
            //$GC_BATT,voltage:19.9,level:3
            let batt = this.getJsObject(textLine,true);
            if(batt != null)
               this.setBatteryState(batt.voltage,batt.level);
        }
        else
        if (inp.startsWith("$GC_U,")) {
            let update = this.getJsObject(textLine,true);            
            this.message.textContent = `Speed ${update.v} > ${update.vMax} [${update.dt}/${update.tMax}]`;
        }
        else
        if (inp.startsWith("$GC_M,")) {
            let toMe = this.getJsObject(textLine,false);            
            this.message.textContent = toMe.msg;
        }
        else
        if (inp.startsWith("$GC_C,")) {
            let conclusion = this.getJsObject(textLine,true);            
            if(conclusion.ok==1) {
                this.message.textContent = `Stable at ${conclusion.v} [mm/min] after ${conclusion.dt} seconds.`;
            } else
                this.message.textContent = `Unstable at ${conclusion.v} [mm/min] after ${conclusion.dt} seconds.`;
        }
        this.render();
    }

    attributeChangedCallback() {
        this.componentIdentifier = this.getAttribute("componentIdentifier") || "DataUnit";
        this.usbLink.configure({
            componentIdentifier: this.componentIdentifier,
            storageScope: this.id || this.componentIdentifier || "default",
        });
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
                this.usbLink.writeLine("du:batt?");
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

    sendCmd(messageToSend) {
        if(this.usbLink.linkState=='connected')     // nb the usbLink.isConnected is not valid
            this.usbLink.writeLine(messageToSend);
        else
        if(this.bleLink.linkState=='connected') 
            this.bleLink.writeLine(messageToSend);
    }

    onBleLinkStatus(event) {
        const state = event?.detail?.state;
        if (state) {
            if (state === "connected") {
                this.bleButton.style.color = "green";
                this.bleLink.writeLine("du:batt?");
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
            const titleText = languageCatalog?.[this.componentIdentifier]?.title || "Data Unit";
            this.titleElement.textContent = titleText;
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
        this.titleElement.textContent = this.getAttribute("title") || "Graph";
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