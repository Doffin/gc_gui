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

    .top-bar {
        width: 90%;
        display: flex;
        flex-direction: row;
        gap: 6px;
        justify-content: left;
        margin: 6px;
        padding: 6px;
    }

  </style>

    <div class="body">
        <div class="top-bar">
            <div class="" id="title">Title</div>
            <div class=""><select class="" id="selectTestProcedure"></select></div>
            <div class=""><select class="" id="selectPlateDiameter"></select></div>
        <slot></slot>
        </div>
    </div>
`;

class GCProcedureBar extends HTMLElement {
    static get observedAttributes() {
        return ["title", "componentIdentifier"];
    }

    constructor() {
        super();
        const root = this.attachShadow({ mode: "open" });
        root.append(template.content.cloneNode(true));
        this.titleElement = root.getElementById("title");
        this.onLanguageChange = this.onLanguageChange.bind(this);
        this.componentIdentifier = this.getAttribute("componentIdentifier") || "ProcedureBar";
        this.selectTestProcedureElement = root.getElementById("selectTestProcedure");
        this.onTestProcedureChange = this.onTestProcedureChange.bind(this);
        this.selectPlateDiameterElement = root.getElementById("selectPlateDiameter");
        this.onPlateDiameterChange = this.onPlateDiameterChange.bind(this);
    }

    connectedCallback() {
        // Listen for language change events
        document.addEventListener("app-language-change", this.onLanguageChange);
        this.selectTestProcedureElement.addEventListener('change', this.onTestProcedureChange);
        this.selectPlateDiameterElement.addEventListener('change', this.onPlateDiameterChange);
        this.initTestProcedures();
        this.render();
    }

    attributeChangedCallback() {
        this.componentIdentifier = this.getAttribute("componentIdentifier") || "ProcedureBar";
        this.render();
    }

    disconnectedCallback() {
        document.removeEventListener("app-language-change", this.onLanguageChange);
        this.selectTestProcedureElement.removeEventListener('change', this.onTestProcedureChange);
        this.selectPlateDiameterElement.removeEventListener('change', this.onPlateDiameterChange);
        // No need to call super.disconnectedCallback() because HTMLElement doesn't have it
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
        const titleText = languageCatalog?.[this.componentIdentifier]?.title || "ProcedureBar";
        this.titleElement.textContent = titleText;
    }

    onTestProcedureChange(event) {
        //console.log(event);
        let fName = this.selectTestProcedureElement.value;
        this.loadTestProcedure(fName);
    }

    onPlateDiameterChange(event) {
        console.log(event);
    }


    async initTestProcedures() {
        const url = `${import.meta.env.BASE_URL}test_procedures/procedures.json`;
        const response = await fetch(url);
        const jsn = await response.json();
        let list = this.selectTestProcedureElement;
        while (list.hasChildNodes()) {
            list.removeChild(list.firstChild);
        }
        let procedures = jsn.options;
        for (let n = 0; n < procedures.length; n++) {
            let newOption = document.createElement("option");
            newOption.text = procedures[n].label;
            newOption.value = procedures[n].fileName;
            if (jsn.factoryDefault == newOption.value) newOption.selected = true;
            this.selectTestProcedureElement.add(newOption);
        }
        this.loadTestProcedure(jsn.factoryDefault);
    }

    async loadTestProcedure(procedureName) {
        const url = `${import.meta.env.BASE_URL}test_procedures/${procedureName}`;
        const response = await fetch(url);
        const pro = await response.json();
        let options = pro.plateDiameterOptions;
        let list = this.selectPlateDiameterElement;
        while (list.hasChildNodes()) {
            list.removeChild(list.firstChild);
        }
        for (let n = 0; n < options.length; n++) {
            let newOption = document.createElement("option");
            newOption.text = options[n];
            newOption.value = options[n];
            if (pro.plateDiameter_mm == newOption.value) newOption.selected = true;
            this.selectPlateDiameterElement.add(newOption);
        }
        

    }


    render() {
        this.titleElement.textContent = this.getAttribute("title") || "ProcedureBar";
    }

}

customElements.define("gc-procedure-bar", GCProcedureBar);

export { GCProcedureBar };
