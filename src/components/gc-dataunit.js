import w3_css from "./w3.css?inline";
import {GCDataLink} from "./gc-datalink.js";

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
    <h2 id="title" class="w3-center w3-text-blue w3-medium w3-left">Component Name</h2>
    <button id="connectButton" class="w3-button w3-blue w3-round w3-small w3-right">Connect</button>    
    <table class="w3-table w3-hoverable my_table">
        <thead id="tableHeader">
        <tr id="tableHeaderRow"> </tr>
            <!-- Header row will be dynamically added here -->
        </thead>
        <tbody id="tableBody">
            <!-- Rows will be dynamically added here -->
        </tbody>
    </table>

    <slot></slot>
    </div>
  </div>
`;
class GCDataUnit extends HTMLElement {
    static get observedAttributes() {
        return ["title","componentIdentifier"];
    }

    constructor() {
        super();
        const root = this.attachShadow({ mode: "open" });
        root.append(template.content.cloneNode(true));
        this.titleElement = root.getElementById("title");
        this.connectButton = root.getElementById("connectButton");
        this.onLanguageChange = this.onLanguageChange.bind(this);
        this.componentIdentifier = this.getAttribute("componentIdentifier") || "DataUnit";  
        this.dataLink = new GCDataLink();
        this.dataLink.observer = this; // Let us be the owner and observer of this link
        // we want to be notified when new lines of data are available 
        // and when the link state changes.
        this.updateLinkState(this.dataLink.getPortStatus().state);
    }

    connectedCallback() {
        // Listen for language change events
        document.addEventListener("app-language-change", this.onLanguageChange);

        this.connectButton.addEventListener("click", () => {
            if (this.dataLink.getPortStatus().state === "connected") {
                this.dataLink.disconnectPort({ intentional: true });
            } else {
                this.dataLink.connectPort();
            }
        });
        this.render();
    }

    updateLinkState(state) {
        console.log(`Link state updated to: ${state}`);
        if (state === "connected") {
            this.connectButton.textContent = "Disconnect";
        } else {
            this.connectButton.textContent = "Connect";
        }
    }

    processIncomingLine(textLine) {
        console.log("Received line from data link:", textLine);
        // Here you can process the incoming line as needed, e.g., update the table or perform other actions.
    }

    attributeChangedCallback() {
        this.componentIdentifier = this.getAttribute("componentIdentifier") || "DataUnit";
        this.dataLink.componentIdentifier = this.componentIdentifier;
        this.render();
    }

    disconnectedCallback() {
        document.removeEventListener("app-language-change", this.onLanguageChange);

        // No need to call super.disconnectedCallback() because HTMLElement doesn't have it
    }

    async onNewLine(event) {
        const detail = event?.detail;
        if (detail && typeof detail.line === "string") {
            console.log("Received new line:", detail.line);
            // Here you can process the new line as needed, e.g., update the table or perform other actions.
        }
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
            const titleText = languageCatalog?.[this.componentIdentifier]?.title || "Data Unit";
            this.titleElement.textContent = titleText;
            const tableHeaderData = this.getMeasurementTableHeader(languageCatalog);
            if (tableHeaderData) {
                this.setTableHeaderWithUnits(tableHeaderData);
            }
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

customElements.define("gc-dataunit", GCDataUnit);

export { GCDataUnit };