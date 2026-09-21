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
        this.languageSelectElement = root.getElementById("languageSelect");
        this.appStore = null;

    }

    connectedCallback() {
        // Listen for language change events
        this.appStore?.addEventListener("language-changed", this.onLanguageChange);
        this.render();
    }

    disconnectedCallback() {
        this.appStore?.removeEventListener("language-changed", this.onLanguageChange);
        // No need to call super.disconnectedCallback() because HTMLElement doesn't have it
    }
    
    attributeChangedCallback() {
        this.key = this.getAttribute("key") || this.constructor.prefix; 
        this.render();  
    }

    setAppStore(appStore) {
        if (!appStore || typeof appStore.getLanguage !== "function") throw new TypeError("appStore must provide getLanguage()");
        this.appStore?.removeEventListener("language-changed", this.onLanguageChange);
        this.appStore = appStore;
        this.languageSelectElement.setAppStore(appStore);
        if (this.isConnected) {
            this.appStore.addEventListener("language-changed", this.onLanguageChange);
            const language = appStore.getLanguage();
            if (language) this.onLanguageChange({ detail: language });
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

}

customElements.define("gc-settings-page", GCSettingsPage);

export { GCSettingsPage };
