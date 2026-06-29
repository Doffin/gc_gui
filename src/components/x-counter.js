import w3css from "./w3.css?inline";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    ${w3css}

    :host {
      display: block;
    }

    .counter {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 999px;
      border: 1px solid #bae6fd;
      background: #f0f9ff;
      color: #0f172a;
    }

    button {
      border: 0;
      border-radius: 999px;
      padding: 0.45rem 0.85rem;
      font: inherit;
      background: #0ea5e9;
      color: white;
      cursor: pointer;
    }

    button:hover {
      background: #0284c7;
    }

    output {
      min-width: 2ch;
      text-align: right;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }
  </style>

  <div class="w3-card-4 w3-padding">
    <button class="w3-button w3-red" type="button" id="increment">Increment</button>
    <output id="value">0</output>
  </div>
`;

class XCounter extends HTMLElement {
  static sayHello(inputValue) {
    console.log("Hello from XCounter class! Input value:", inputValue);
  }

  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    root.append(template.content.cloneNode(true));

    this.valueEl = root.getElementById("value");
    this.incrementButton = root.getElementById("increment");
    this.value = Number(this.getAttribute("start") || 0);
    this.step = Number(this.getAttribute("step") || 1);

    this.onIncrement = this.onIncrement.bind(this);
  }

  connectedCallback() {
    this.incrementButton.addEventListener("click", this.onIncrement);
    this.render();
  }

  disconnectedCallback() {
    this.incrementButton.removeEventListener("click", this.onIncrement);
  }

  onIncrement() {
    this.value += this.step;
    this.dispatchEvent(
      new CustomEvent("count-change", {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
    this.render();
  }

  render() {
    this.valueEl.textContent = String(this.value);
  }

  sayHello(inputValue) {
    console.log("Hello from XCounter instance! Input value:", inputValue);
  }
}
customElements.define("x-counter", XCounter);
export { XCounter };
