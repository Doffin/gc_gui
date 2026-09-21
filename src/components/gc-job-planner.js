import w3_css from "./w3.css?inline";
import { GCSelect } from "./gc-select.js";
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
                        <gc-select id="clientName" key="clientName" label="Client Name"></gc-select>
                    </div>
                    <div class="w3-half">
                        <gc-select id="projectName" key="projectName" label="Project Name"></gc-select>
                    </div>
                    <div class="w3-half">
                        <gc-select id="subProjectName" key="subProjectName" label="Sub Project Name"></gc-select>
                    </div>
                    <div class="w3-half">
                        <gc-select id="jobName" key="jobName" label="Job Name" value="Nr 1"></gc-select>
                    </div>
                    <div class="w3-half">
                        <gc-procedure-bar></gc-procedure-bar>
                    </div>

                </div>
            </div>
        <slot></slot>
        </div>
    </div>
`;

class GCJobPlanner extends HTMLElement {
    static get observedAttributes() {
        return ["title"];
    }

    constructor() {
        super();
        this.key = "JobPlanner";
        const root = this.attachShadow({ mode: "closed" });
        root.append(template.content.cloneNode(true));
        this.titleElement = root.getElementById("title");
        this.onLanguageChange = this.onLanguageChange.bind(this);
        this.projectNameElement   = root.getElementById("projectName");
        this.subProjectNameElement = root.getElementById("subProjectName");
        this.clientNameElement = root.getElementById("clientName");
        this.operatorNameElement = root.getElementById("operatorName") || null;
        this.procedureBarElement = root.querySelector("gc-procedure-bar");
        this.loadDataFromJson = this.loadDataFromJson.bind(this);
    }

    setAppStore(appStore) {
        this.procedureBarElement.setAppStore(appStore);
    }

    connectedCallback() {
        // Listen for language change events
        document.addEventListener("new-language-selected", this.onLanguageChange);
        this.loadDataFromJson();
        this.render();
    }

    disconnectedCallback() {
        document.removeEventListener("new-language-selected", this.onLanguageChange);
        // No need to call super.disconnectedCallback() because HTMLElement doesn't have it
    }
    
    attributeChangedCallback() {
  //      this.key = this.getAttribute("key") || "JobPlanner";        
        this.render();  
    }

    async loadDataFromJson() {
        try {
            const response = await fetch("data/Master.json");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const projects = data.projects || [];
            let  projectList = projects.map(project => project.name).join("\n");
            this.projectNameElement.setAttribute("options", projectList );

            const clients = data.clients || [];
            let  clientList = clients.map(client => client.name).join("\n");
            this.clientNameElement.setAttribute("options", clientList);
            const subProjects = data.projects[0]?.subProjects || [];
            let  subProjectList = subProjects.map(subProject => subProject.name).join("\n");
            this.subProjectNameElement.setAttribute("options", subProjectList);
            this.render();
        } catch (error) {
            console.error("Failed to load data from JSON:", error);
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
        
        this.title = languageCatalog?.[this.key]?.title || this.key;
        
        let record = languageCatalog?.[this.key]?.properties?.find(p => p.key === "projectName");
        this.projectNameElement.updateComponent(record);
        record = languageCatalog?.[this.key]?.properties?.find(p => p.key === "subProjectName");
        this.subProjectNameElement.updateComponent(record);
        record = languageCatalog?.[this.key]?.properties?.find(p => p.key === "clientName");
        this.clientNameElement.updateComponent(record);
     /*   
        record = languageCatalog?.[this.key]?.properties?.find(p => p.key === "operatorName");
        this.operatorNameElement.updateComponent(record);
        */
        this.render();
    }

    render() {
        this.titleElement.textContent = this.getAttribute("title") || this.key;
    }

}

customElements.define("gc-job-planner", GCJobPlanner);

export { GCJobPlanner };
