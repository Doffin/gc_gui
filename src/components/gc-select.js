import w3_css from "./w3.css?inline";

const EDIT_SENTINEL_VALUE = "__gc_select_edit__";

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

    .select-field {
        width: 100%;
    }

    .editor {
        display: grid;
        gap: 6px;
        width: 100%;
    }

    .editor[hidden] {
        display: none !important;
    }

    .editor textarea {
        width: 100%;
        min-height: 8rem;
        resize: vertical;
        font-size: 0.9em;
        line-height: 1.4;
        padding: 6px;
    }

    .editor-actions {
        display: flex;
        gap: 6px;
        justify-content: flex-end;
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
          <p class="metric-label" id="labelId">Label</p>
                    <p class="metric-value">
                        <select id="valueId" class="w3-select select-field"></select>
                        <div id="editor" class="editor" hidden>
                            <textarea id="editorText" class="w3-input" spellcheck="false"></textarea>
                            <div class="editor-actions">
                                <button id="cancelBtn" class="w3-button w3-border">Cancel</button>
                                <button id="saveBtn" class="w3-button w3-blue">Save</button>
                            </div>
                        </div>
                    </p>
        </div>     
        <slot></slot>
        </div>
    </div>
`;

class GCSelect extends HTMLElement {

    static get observedAttributes() {
        return ["label", "value", "key", "editable", "options", "placeholder"];
    }

    constructor() {
        super();
        const root = this.attachShadow({ mode: "open" });
        root.append(template.content.cloneNode(true));

        this.labelElement = root.getElementById("labelId");
        this.selectElement = root.getElementById("valueId");
        this.editorElement = root.getElementById("editor");
        this.editorTextElement = root.getElementById("editorText");
        this.saveButton = root.getElementById("saveBtn");
        this.cancelButton = root.getElementById("cancelBtn");

        this.key = this.getAttribute("key") || "Select";
        this.items = [];
        this.isEditing = false;

        this.updateComponent = this.updateComponent.bind(this);
        this.onSelectChange = this.onSelectChange.bind(this);
        this.onSaveClick = this.onSaveClick.bind(this);
        this.onCancelClick = this.onCancelClick.bind(this);

        this.updateComponent = this.updateComponent.bind(this);
    }

    connectedCallback() {
        this.selectElement.addEventListener("change", this.onSelectChange);
        this.saveButton.addEventListener("click", this.onSaveClick);
        this.cancelButton.addEventListener("click", this.onCancelClick);
        this.render();
    }

    disconnectedCallback() {
        this.selectElement.removeEventListener("change", this.onSelectChange);
        this.saveButton.removeEventListener("click", this.onSaveClick);
        this.cancelButton.removeEventListener("click", this.onCancelClick);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) {
            return;
        }

        if (name === "key") {
            this.key = newValue || "Select";
        }
        this.render();
    }

    updateComponent(record) {
        this.label = record.label;
        //this.value = record.value;
        this.placeholder = record.placeHolder;
        this.edit = record.edit || "Edit...";
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

    get editable() {
        return this.getAttribute("editable") !== "false";
    }

    set editable(isEditable) {
        this.setAttribute("editable", isEditable ? "true" : "false");
    }

    get placeholder() {
        return this.getAttribute("placeholder") || "";
    }

    set placeholder(value) {
        this.setAttribute("placeholder", value ?? "");
    }

    get options() {
        return [...this.items];
    }

    normalizeItems(nextItems) {
        const unique = [];
        const seen = new Set();
        for (const rawItem of Array.isArray(nextItems) ? nextItems : []) {
            const item = String(rawItem).trim();
            if (!item || seen.has(item)) {
                continue;
            }
            seen.add(item);
            unique.push(item);
        }
        return unique;
    }

    set options(nextItems) {
        const normalizedItems = this.normalizeItems(nextItems);
        this.items = normalizedItems;
        this.setAttribute("options", normalizedItems.join("\n"));
        this.render();
    }

    parseOptionsAttribute() {
        const raw = this.getAttribute("options");
        if (!raw) {
            return [];
        }

        const normalized = raw.replace(/,/g, "\n");
        return this.normalizeItems(
            normalized
            .split(/\r?\n/)
            .map((item) => item.trim())
            .filter((item) => item.length > 0),
        );
    }

    ensureOptions() {
        this.items = this.parseOptionsAttribute();

        if (this.items.length === 0 && this.value) {
            this.items = [this.value];
        }

        const currentValue = this.value;
        if (currentValue && !this.items.includes(currentValue)) {
            this.items.push(currentValue);
        }
    }

    ensureSelectedValue() {
        if (!this.value && this.items.length > 0 && !this.placeholder) {
            this.value = this.items[0];
        }
    }

    populateSelectOptions() {
        this.selectElement.replaceChildren();

        if (this.placeholder) {
            const placeholderOption = document.createElement("option");
            placeholderOption.value = "";
            placeholderOption.textContent = this.placeholder;
            placeholderOption.disabled = true;
            this.selectElement.appendChild(placeholderOption);
        }

        for (const item of this.items) {
            const option = document.createElement("option");
            option.value = item;
            option.textContent = item;
            this.selectElement.appendChild(option);
        }

        if (this.editable) {
            const editOption = document.createElement("option");
            editOption.value = EDIT_SENTINEL_VALUE;
            editOption.textContent = this.edit || "Edit...";
            this.selectElement.appendChild(editOption);
        }
    }

    updateComponent(record) {
        if(record == null) return;
        this.label = record.label;
        this.placeholder = record.placeHolder;
        this.edit = record.edit || "Edit...";
        // Get the editOption.value = EDIT_SENTINEL_VALUE; from options and update the textContent.
        const editOption = this.selectElement.querySelector(`option[value="${EDIT_SENTINEL_VALUE}"]`);
        if (editOption) {
            editOption.textContent = this.edit || "Edit...";
        }   
    }

    emitValueChange(value) {
        this.dispatchEvent(
            new CustomEvent("change", {
                detail: {
                    value,
                    key: this.key,
                    source: this.id || this.tagName.toLowerCase(),
                },
                bubbles: true,
                composed: true,
            }),
        );
    }

    emitOptionsChange(items) {
        this.dispatchEvent(
            new CustomEvent("options-change", {
                detail: {
                    options: items,
                    key: this.key,
                    source: this.id || this.tagName.toLowerCase(),
                },
                bubbles: true,
                composed: true,
            }),
        );
    }

    onSelectChange() {
        const selectedValue = this.selectElement.value;
        if (selectedValue === EDIT_SENTINEL_VALUE) {
            this.enterEditMode();
            return;
        }

        this.value = selectedValue;
        this.emitValueChange(selectedValue);
    }

    enterEditMode() {
        if (!this.editable) {
            return;
        }

        this.isEditing = true;
        this.editorTextElement.value = this.items.join("\n");
        this.render();
        this.editorTextElement.focus();
        this.editorTextElement.select();
    }

    exitEditMode() {
        this.isEditing = false;
        this.render();
    }

    onSaveClick() {
        const updatedItems = this.normalizeItems(
            this.editorTextElement.value
            .split(/\r?\n/)
            .map((item) => item.trim())
            .filter((item) => item.length > 0),
        );

        this.items = updatedItems;
        this.setAttribute("options", updatedItems.join("\n"));

        if (updatedItems.length === 0) {
            this.value = "";
        } else if (!updatedItems.includes(this.value)) {
            this.value = updatedItems[0];
        }

        this.emitOptionsChange([...updatedItems]);
        this.emitValueChange(this.value);
        this.exitEditMode();
    }

    onCancelClick() {
        this.exitEditMode();
    }

    render() {
        this.ensureOptions();
        this.ensureSelectedValue();

        this.labelElement.textContent = this.label;

        this.populateSelectOptions();
        if (this.value) {
            this.selectElement.value = this.value;
        } else if (this.placeholder) {
            this.selectElement.value = "";
        }

        this.selectElement.hidden = this.isEditing;
        this.editorElement.hidden = !this.isEditing;
        this.selectElement.disabled = this.items.length === 0 && !this.editable;
    }

}

customElements.define("gc-select", GCSelect);

export { GCSelect };
