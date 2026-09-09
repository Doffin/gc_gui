import w3_css from "./w3.css?inline";
import { GCLanguageSelect } from "./gc-language-select.js";
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

    .gc-select-row {
        width: 100%;
        display: flex;
        flex-direction: row;
        gap: 6px;
        justify-content: left;
        margin: 6px;
        padding: 6px;
    }

  </style>

    <div class="body">
        <div class="w3-container w3-padding">
            <div class="control-bar w3-text-blue w3-medium w3-left" id="title">Title</div>
            <div class="w3-row gc-select-row">
                <div class="w3-col s12 m6 l6">
                    <div class="w3-half">
                        <gc-language-select id="languageSelect" key="languageSelect"></gc-language-select>
                    </div>

                </div>
            </div>
        <slot></slot>
        </div>
    </div>
`;

class GCSettingsPage extends HTMLElement {
    static get prefix() {
        return "SettingsPage";
    }

    static get observedAttributes() {
        return ["title", "key"];
    }
    
    constructor() {
        super();
        const root = this.attachShadow({ mode: "closed" });
        root.append(template.content.cloneNode(true));
        this.titleElement = root.getElementById("title");
        this.onLanguageChange = this.onLanguageChange.bind(this);
        this.key = this.getAttribute("key") || this.constructor.prefix;

    }

    connectedCallback() {
        // Listen for language change events
        document.addEventListener("new-language-selected", this.onLanguageChange);
        this.render();
    }

    disconnectedCallback() {
        document.removeEventListener("new-language-selected", this.onLanguageChange);
        // No need to call super.disconnectedCallback() because HTMLElement doesn't have it
    }
    
    attributeChangedCallback() {
        this.key = this.getAttribute("key") || this.constructor.prefix; 
        this.render();  
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
        const titleText = languageCatalog?.[this.key]?.title || this.constructor.prefix;
        this.titleElement.textContent = titleText;
/*        
        let record = languageCatalog?.[this.key]?.properties?.find(p => p.key === "projectName");
        this.projectNameElement.updateComponent(record);
        record = languageCatalog?.[this.key]?.properties?.find(p => p.key === "subProjectName");
        this.subProjectNameElement.updateComponent(record);
        record = languageCatalog?.[this.key]?.properties?.find(p => p.key === "clientName");
        this.clientNameElement.updateComponent(record);
        record = languageCatalog?.[this.key]?.properties?.find(p => p.key === "operatorName");
        this.operatorNameElement.updateComponent(record);
        */
    }

    render() {
        this.titleElement.textContent = this.getAttribute("title") || this.constructor.prefix; 
    }

    sendCmd(textToSend) {
        document.dispatchEvent(
            new CustomEvent("gc-send-cmd", {
                detail: {
                    textLine: textToSend,
                    componentIdentifier: this.key,
                },
            }),
        );
        return true;
    }
}

customElements.define("gc-settings-page", GCSettingsPage);

export { GCSettingsPage };
