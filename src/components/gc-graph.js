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
 
   table {
      font-family: arial, sans-serif;
      font-size: 0.8rem;
      border-collapse: collapse;
      width: 100%;

    }

    .my_table th {
      background: #2f3744;
      color: #fff;
      border: 1px solid #335555;    
      text-align: center;
      padding: 8px;
    }

    .my_table td{
        border: 1px solid #dddddd;
        text-align: center;
        padding: 8px;
    }

  </style>

  <div class="w3-container">
    <div class="body">
    <h2 id="title" class="w3-center w3-text-blue w3-medium w3-left">Graph</h2>
    <table class="w3-table w3-hoverable my_table">
        <thead id="tableHeader">
        <tr id="tableHeaderRow"> </tr>
            <!-- Header row will be dynamically added here -->
        </thead>
        <tbody id="tableBody">
            <!-- Measurement rows will be dynamically added here -->
        </tbody>
    </table>

    <slot></slot>
    </div>
  </div>
`;
class GCGraph extends HTMLElement {
    static get observedAttributes() {
        return ["title","componentIdentifier"];
    }

    constructor() {
        super();
        const root = this.attachShadow({ mode: "open" });
        root.append(template.content.cloneNode(true));
        this.titleElement = root.getElementById("title");
        this.onLanguageChange = this.onLanguageChange.bind(this);
        this.componentIdentifier = this.getAttribute("componentIdentifier") || "MeasurementGraph";  
    }

    connectedCallback() {
        // Listen for language change events
        document.addEventListener("app-language-change", this.onLanguageChange);
        let myPrefix = this.componentIdentifier;
        document.addEventListener(myPrefix+"-add-row", this.onAddRow.bind(this));
        this.render();
    }

    attributeChangedCallback() {
        this.componentIdentifier = this.getAttribute("componentIdentifier") || "MeasurementGraph";
        this.render();
    }

    disconnectedCallback() {
        document.removeEventListener("app-language-change", this.onLanguageChange);
        let myPrefix = this.componentIdentifier;
        document.removeEventListener(myPrefix+"-add-row", this.onAddRow.bind(this));
        // No need to call super.disconnectedCallback() because HTMLElement doesn't have it
    }

    async onAddRow(event) {
        const detail = event?.detail;
        if (detail && Array.isArray(detail.rowData)) {
            this.appendRowToTable(detail.rowData);
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
        const titleText = languageCatalog?.[this.componentIdentifier]?.title || "Graph";
        this.titleElement.textContent = titleText;
        // We will have to update this to a Graph relevant function, but for now,
        // we just make a small table with what will become xaxi and yaxis legend, units etc.
        // Just to see the consept works.
        // Yes, now we have working language change etc. Cool! 
        // I think we need to reduce the font-size for the table headers, they are very big now.

        const tableHeaderData = this.getMeasurementTableHeader(languageCatalog);
        if (tableHeaderData) {
            this.setTableHeaderWithUnits(tableHeaderData);
        }
        const blankRows = languageCatalog?.[this.componentIdentifier]?.blankRows || 5;
        if(this.getRowCount() != blankRows) {
            // Let us add blank lines so we see something.
            this.initBlankLines(blankRows-this.getRowCount());
        }
    
    }
    
    initBlankLines(numberToInit) {
        const getNumberOfColumns = this.shadowRoot.getElementById("tableHeaderRow").children.length;
        for (let i = 0; i < numberToInit; i++) {
            this.appendRowToTable(new Array(getNumberOfColumns).fill(""));
        }
    }

    getMeasurementTableHeader(languageCatalog) {
        const tableHeader = languageCatalog?.[this.componentIdentifier]?.tableHeader;
        if (!tableHeader || typeof tableHeader !== "object") {
            return null;
        }
        return Array.isArray(tableHeader) ? tableHeader : Object.values(tableHeader);
    }

    addTrace(direction, text) {
        let level = "debug";
        if (direction === "ERR") {
            level = "error";
        }
        this.emitAppLog(level, `${direction}: ${text}`);
    }

    render() {
        this.titleElement.textContent = this.getAttribute("title") || "Graph";
    }

    setTableHeader(headerData) {
        const headerRow = this.shadowRoot.getElementById("tableHeaderRow");
        headerRow.innerHTML = ""; // Clear existing header cells
        headerData.forEach((headerText) => {
            const newHeaderCell = document.createElement("th");
            newHeaderCell.textContent = headerText;
            headerRow.appendChild(newHeaderCell);
        });
    }

    setTableHeaderWithUnits(headerData) {
        const headerRow = this.shadowRoot.getElementById("tableHeaderRow");
        headerRow.innerHTML = ""; 
        headerData.forEach((headerText) => {
            const newHeaderCell = document.createElement("th");
            if(headerText.label === undefined || headerText.label === null) {
                headerText.label = "????";
            } 
            if(headerText.unit!== null && headerText.unit !== undefined) {
                newHeaderCell.innerHTML = headerText.label+"<br>["+headerText.unit+"]";
            } else {
                newHeaderCell.textContent = headerText.label;
            }
            if(headerText.tooltip !== undefined && headerText.tooltip !== null  && headerText.tooltip !== "") {
                newHeaderCell.title = headerText.tooltip;
            }
            headerRow.appendChild(newHeaderCell);
        });
    }

    appendRowToTable(rowData) {
        const tableBody = this.shadowRoot.getElementById("tableBody");
        const newRow = document.createElement("tr");

        rowData.forEach((cellData) => {
            const newCell = document.createElement("td");
            newCell.textContent = cellData;
            newRow.appendChild(newCell);
        });
        tableBody.appendChild(newRow);
    }
    getRowCount() {
        const tableBody = this.shadowRoot.getElementById("tableBody");
        return tableBody.rows.length;
    }
    removeRowFromTable(rowIndex) {
        const tableBody = this.shadowRoot.getElementById("tableBody");
        if (rowIndex >= 0 && rowIndex < tableBody.rows.length) {
            tableBody.deleteRow(rowIndex);
        }
    }

    removeAllRowsFromTable() {
        const tableBody = this.shadowRoot.getElementById("tableBody");
        tableBody.innerHTML = ""; // Clear all rows
        this.render();
    }
    
    parseNumber(value) {
        const numeric = Number.parseFloat(value);
        return Number.isFinite(numeric) ? numeric : null;
    }

    formatMetric(value, decimals, fallbackValue) {
        return value == null ? fallbackValue : value.toFixed(decimals);
    }

}

customElements.define("gc-graph", GCGraph);

export { GCGraph };
