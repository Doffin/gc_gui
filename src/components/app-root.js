import "./x-card.js";
import "./x-counter.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
      min-height: 100dvh;
      padding: 2rem;
      background: radial-gradient(circle at top left, #f6efe6, #f2f7ff 50%, #eaf7f0);
      color: #1f2937;
      font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    }

    .layout {
      max-width: 820px;
      margin: 0 auto;
      display: grid;
      gap: 1rem;
    }

    h1 {
      margin: 0;
      font-size: clamp(1.7rem, 2vw + 1rem, 2.5rem);
      letter-spacing: 0.02em;
    }

    p {
      margin: 0;
      color: #374151;
      line-height: 1.5;
    }
  </style>

  <main class="layout">
    <h1>Web Components Playground</h1>
    <p>Everything here is built with Custom Elements and Shadow DOM.</p>

    <x-card title="Starter card">
      You can slot any HTML content inside this card.
    </x-card>

    <x-counter start="2" step="1"></x-counter>
  </main>
`;

class AppRoot extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    root.append(template.content.cloneNode(true));
  }
}

customElements.define("app-root", AppRoot);
