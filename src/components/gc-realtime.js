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
        font-size: 12px;
        font-weight: 600;
        color: #616F76;
        white-space: nowrap;
    }

    .metric-value {
        margin: 2px 0 0;
        font-size: 40px;
        line-height: 1;
        font-weight: 700;
        color: #313F46;
        white-space: nowrap;
    }

    .metric-unit {
        display: inline-block;
        font-size: 0.6em;
        font-weight: 500;
        white-space: nowrap;
    }

  </style>

    <div class="body">
        <div class="metric-item" id="title">
          <p class="metric-label" id="labelId">Kraft</p>
          <p class="metric-value"><span id="valueId">0.0</span> <span class="metric-unit" id="unitId">kN</span></p>
        </div>     
        <slot></slot>
        </div>
    </div>
`;

class GCRealtime extends HTMLElement {

    static get observedAttributes() {
        return ["label", "value", "unit", "decimals", "componentIdentifier"];
    }

    constructor() {
        super();
        const root = this.attachShadow({ mode: "open" });
        root.append(template.content.cloneNode(true));
//        this.onLanguageChange = this.onLanguageChange.bind(this);
        this.labelElement = root.getElementById("labelId");
        this.valueElement = root.getElementById("valueId");
        this.unitElement = root.getElementById("unitId");
        this.componentIdentifier = this.getAttribute("componentIdentifier") || "Realtime";
        this.updateComponent = this.updateComponent.bind(this);
    }

    connectedCallback() {
//        document.addEventListener("app-language-change", this.onLanguageChange);
        this.render();
    }

    disconnectedCallback() {
//        document.removeEventListener("app-language-change", this.onLanguageChange);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) {
            return;
        }

        if (name === "componentIdentifier") {
            this.componentIdentifier = newValue || "Realtime";
        }
        this.render();
    }


    get label() {
        return this.getAttribute("label") || "";
    }

    set label(value) {
        this.setAttribute("label", value ?? "");
    }

    get value() {
        return this.getAttribute("value") || "";
    }

    set value(nextValue) {
        this.setAttribute("value", nextValue ?? "");
    }

    get unit() {
        return this.getAttribute("unit") || "";
    }

    set unit(value) {
        this.setAttribute("unit", value ?? "");
    }

    get decimals() {
        const rawValue = this.getAttribute("decimals");
        if (rawValue == null || rawValue === "") {
            return null;
        }

        const parsed = Number.parseInt(rawValue, 10);
        return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
    }

    set decimals(value) {
        this.setAttribute("decimals", value ?? "");
    }

    updateComponent(record) {
        this.label = record.label;
        this.unit  = record.unit;
    }

    formatValue() {
        const rawValue = this.value;
        const decimals = this.decimals;
        if (decimals == null) {
            return rawValue;
        }

        const numericValue = Number.parseFloat(rawValue);
        if (!Number.isFinite(numericValue)) {
            return rawValue;
        }

        return numericValue.toFixed(decimals);
    }
/*
    async onLanguageChange(event) {
        const languageCatalog = event?.detail?.catalog;
        if (languageCatalog) {
            await this.applyLanguageChange(languageCatalog);
        }
    }

    async applyLanguageChange(languageCatalog) {
        if(!languageCatalog) return;
        const translatedLabel = languageCatalog?.[this.componentIdentifier]?.title;
        if (typeof translatedLabel === "string" && translatedLabel.length > 0) {
            this.labelElement.textContent = translatedLabel;
            return;
        }

        this.labelElement.textContent = this.label;
    }
*/
    render() {
        this.labelElement.textContent = this.label;
        this.valueElement.textContent = this.formatValue();
        this.unitElement.textContent = this.unit;
    }

}

customElements.define("gc-realtime", GCRealtime);

export { GCRealtime };
