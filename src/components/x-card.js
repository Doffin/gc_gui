const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
    }

    article {
      border: 1px solid #c7d2fe;
      background: #ffffffcc;
      backdrop-filter: blur(3px);
      border-radius: 14px;
      padding: 1rem;
      box-shadow: 0 10px 20px -18px #111827;
    }

    h2 {
      margin: 0 0 0.5rem;
      font-size: 1.1rem;
      color: #ff0000;
    }

    .body {
      color: #1f2937;
      line-height: 1.5;
    }
  </style>

  <article>
    <h2 id="title"></h2>
    <div class="body">
      <slot></slot>
    </div>
  </article>
`;

class XCard extends HTMLElement {
  static get observedAttributes() {
    return ["title"];
  }

  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    root.append(template.content.cloneNode(true));
    this.titleEl = root.getElementById("title");
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    this.titleEl.textContent = this.getAttribute("title") || "Card";
  }
}

customElements.define("x-card", XCard);
