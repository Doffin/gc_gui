import w3_css from "./w3.css?inline";

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

    <div class="body">
        <div class="top-bar">
            <div class="" id="title" hidden>Title</div>
            <div class="w3-full">
                <div class="control-bar btn-group">
                    <button id="upButton"   class="w3-button control-button">⇑</button>
                    <button id="offButton" class="w3-button control-button is-active" >⏹︎</button>
                    <button id="downButton" class="w3-button control-button">⇓</button>
                </div>      
            </div>
        <slot></slot>
        </div>
    </div>
`;

class GCPumpControl extends HTMLElement {
    static get observedAttributes() {
        return ["title", "componentIdentifier","pumpState"];
    }

    constructor() {
        super();
        const root = this.attachShadow({ mode: "closed" });
        root.append(template.content.cloneNode(true));
        this.titleElement = root.getElementById("title");
        this.onLanguageChange = this.onLanguageChange.bind(this);
        this.componentIdentifier = this.getAttribute("componentIdentifier") || "Pump";
        this.upButtonElement   = root.getElementById("upButton");
        this.onPumpUpClick     = this.onPumpUpClick.bind(this);

        this.offButtonElement = root.getElementById("offButton");
        this.onPumpOffClick   = this.onPumpOffClick.bind(this);

        this.downButtonElement = root.getElementById("downButton");
        this.onPumpDownClick   = this.onPumpDownClick.bind(this);
        
    }

    connectedCallback() {
        // Listen for language change events
        document.addEventListener("app-language-change", this.onLanguageChange);
        this.upButtonElement.addEventListener('click', this.onPumpUpClick);
        this.offButtonElement.addEventListener('click', this.onPumpOffClick);
        this.downButtonElement.addEventListener('click', this.onPumpDownClick);
        this.pState = 0;
        this.pumpState = this.getAttribute("pumpState") || "0";
        this.render();
    }

    disconnectedCallback() {
        document.removeEventListener("app-language-change", this.onLanguageChange);
        this.upButtonElement.removeEventListener('click', this.onPumpUpClick);
        this.offButtonElement.removeEventListener('click', this.onPumpOffClick);
        this.downButtonElement.removeEventListener('click', this.onPumpDownClick);
        // No need to call super.disconnectedCallback() because HTMLElement doesn't have it
    }
    
    attributeChangedCallback() {
        console.log("Attr changed");
        this.componentIdentifier = this.getAttribute("componentIdentifier") || "Pump";
        this.render();
    }

    get pumpState() { return this.pState; }
    
    set pumpState(value) { 
        if(value!=this.pState) {
            console.log('SetPumpState '+value);
            this.pState = value;
            this.updatePumpState(this.pState); 
        }
    }

    updatePumpState(value) {
        this.downButtonElement.classList.remove('is-active');
        this.offButtonElement.classList.remove('is-active');
        this.upButtonElement.classList.remove('is-active');
        if(value===0) {
            this.offButtonElement.classList.add('is-active');
        }
        if(value===1) {
            this.upButtonElement.classList.add('is-active');
        }
        if(value===2) {
            this.downButtonElement.classList.add('is-active');
        }
    }

    async onLanguageChange(event) {
        const detail = event?.detail;
        const requestedCode = typeof detail === "string" ? detail : detail?.code;
        const languageCatalog = detail?.catalog;
        if (languageCatalog) {
            await this.applyLanguageChange(languageCatalog);
        }
    }

    async applyLanguageChange(languageCatalog) {
        const titleText = languageCatalog?.[this.componentIdentifier]?.title || "Pump";
        this.titleElement.textContent = titleText;
    }

    onPumpUpClick(event) {
        this.sendCmd("pump=up");
    }

    onPumpOffClick(event) {
        this.sendCmd("pump=off");
    }
    
    onPumpDownClick(event) {
        this.sendCmd("pump=down");
    }

    render() {
        this.titleElement.textContent = this.getAttribute("title") || "Pump";
    }

    sendCmd(textToSend) {
        document.dispatchEvent(
            new CustomEvent("gc-send-cmd", {
                detail: {
                    textLine: textToSend,
                    componentIdentifier: this.componentIdentifier,
                },
            }),
        );
        return true;
    }

}

customElements.define("gc-pump-control", GCPumpControl);

export { GCPumpControl };
