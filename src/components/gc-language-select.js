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


    .metric-item {
        margin-bottom: 10px;
    }

    .metric-item:last-child {
        margin-bottom: 0;
    }

    .metric-label {
        margin: 0;
        font-size: 0.7em;
        font-weight: 600;
        color: #616F76;
        white-space: nowrap;
    }

    .metric-value {
        margin: 2px 0 0;
        font-size: 1.0em;
        line-height: 1;
        font-weight: 700;
        color: #313F46;
        white-space: nowrap;
    }

  </style>

    <div class="body">
        <div class="metric-item" id="title">
            <p class="metric-label" id="labelId">Label</p>
            <p class="metric-value">
                <select id="selectId" class="w3-select"></select>
            </p>
        </div>     
        <slot></slot>
        </div>
    </div>
`;

class GCLanguageSelect extends HTMLElement {

    static get observedAttributes() {
        return ["label", "key"];
    }

    constructor() {
        super();
        const root = this.attachShadow({ mode: "open" });
        root.append(template.content.cloneNode(true));

        this.labelElement = root.getElementById("labelId");
        this.selectElement = root.getElementById("selectId");
        this.key = this.getAttribute("key") || "LanguageSelect";
        this.updateComponentOptions = this.updateComponentOptions.bind(this);
        this.emitNewCountryCodeSelected = this.emitNewCountryCodeSelected.bind(this);
    }

    connectedCallback() {
        this.selectElement.addEventListener("change", (event) => {
            const countryCode = event.target.value;
            this.value = countryCode;
            this.emitNewCountryCodeSelected(countryCode);
        });
        this.initializeOptions();
        this.render();
    }

    disconnectedCallback() {
        this.selectElement.replaceWith(this.selectElement.cloneNode(true));
    }

    initializeOptions() {
        const url = new URL(`./locale/languages2.json`, import.meta.url);

        fetch(url)
            .then((response) => response.json())
            .then((data) => {   
                this.updateComponentOptions(data);
            }
            )
            .catch((error) => {
                console.error("Error loading languages2.json:", error);
            }); 
    }

    updateComponentOptions(data) {
        this.labelElement.textContent = data?.label || "Language";
        let items = data?.supportedLanguages || [];
        this.selectElement.innerHTML = "";
        items.forEach((item) => {
            const option = document.createElement("option");
            option.value = item.code;
            option.textContent = item.label;
            this.selectElement.appendChild(option);
        });
        this.value = items.length > 0 ? items[0].code : "";
        this.selectElement.value = this.value;
        this.emitNewCountryCodeSelected(this.value);
    }   


    async emitNewCountryCodeSelected(countryCode) {
        const url = new URL(`./locale/${countryCode}_lang.json`, import.meta.url);
        let response = await fetch(url);
        let catalog = await response.json();
        this.dispatchEvent(
            new CustomEvent("new-language-selected", {
                detail: {
                    code: countryCode,
                    catalog: catalog,
                    key: this.key,
                    source: this.id || this.tagName.toLowerCase(),
                },
                bubbles: true,
                composed: true,
            }),
        );
    }

    render() {
        this.labelElement.textContent = this.label;
    }

}

customElements.define("gc-language-select", GCLanguageSelect);

export { GCLanguageSelect };
