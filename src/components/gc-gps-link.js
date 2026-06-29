import { GCSerialPort } from "./gc-serialport.js";

class GCGPSLink extends GCSerialPort {
  static get observedAttributes() {
    return ["title", "counter"];
  }

  isAutoConnectRequested() {
        const value = this.getAttribute("autoconnect");
        return value == null ? true : value !== "false";
  }

  getExtraStyles() {
    return `
      :host {
        align-self: center;
        --gc-header-padding: 0.1rem 0.25rem;
        --gc-header-padding-top: 12px;
      }

      #openPortButton {
        width: auto;
        flex: 0 1 auto;
        min-width: 6.75rem;
        max-width: 100%;
        min-height: 1.9rem;
        padding: 0.1rem 0.45rem;
        font-size: 0.8rem;
        line-height: 1.1;
        display: inline-flex;
        align-items: center;
        justify-content: flex-start;
        gap: 0.35rem;
        border: 1px solid #cbd5e1;
        border-radius: 0.25rem;
        background: #fff;
        color: #1f2937;
        box-shadow: none;
        cursor: pointer;
      }

      .message-input {
        display: none;
      }

      .header-bar {
        justify-content: flex-end;
        gap: 0.35rem;
      }
    `;
  }

  getTitleButtonWidth() {
    return "auto";
  }

  constructor() {
    super();
    this.position = { latitude: null, longitude: null, altitude: null, fixQuality: null, numSatellites: null };

    this.titleEl?.classList.remove("w3-button", "w3-border", "w3-round", "w3-light-gray", "w3-hover-gray");
    this.titleEl?.classList.add("title-button");

    this.debug = false;
    this.messageEl.style.display = this.debug ? "block" : "none";
  }

  processIncomingLine(line) {
    if (!line.startsWith("$GPGGA")) {
      return true;
    }

    this.parseGPGGA(line);
    this.title = `GPS ${this.toFixed(this.position.latitude, 6)}, ${this.toFixed(this.position.longitude, 6)}`;
    if (this.debug) {
      this.messageEl.value = `Lat: ${this.toFixed(this.position.latitude, 6)}, Lon: ${this.toFixed(this.position.longitude, 6)}, Alt: ${this.toFixed(this.position.altitude, 2)}, Fix: ${this.position.fixQuality}, Sats: ${this.position.numSatellites}`;
    }
    return true;
  }

  getStatusState() {
    if (!this.port) {
      return "red";
    }

    return this.position.fixQuality > 0 ? "green" : "yellow";
  }

  getStatusLabel() {
    if (!this.port) {
      return "Disconnected";
    }

    return this.position.fixQuality > 0 ? "GPS fix acquired" : "Connected, waiting for fix";
  }

  toFixed(x, n) {
    if (x == null || Number.isNaN(Number.parseFloat(x))) {
      return "--";
    }

    return Number.parseFloat(x).toFixed(n);
  }

  parseGPGGA(sentence) {
    const parts = sentence.split(",");
    this.position.latitude = this.parseNmeaCoordinate(parts[2], parts[3]);
    this.position.longitude = this.parseNmeaCoordinate(parts[4], parts[5]);
    this.position.altitude = Number.parseFloat(parts[9]);
    this.position.fixQuality = Number.parseInt(parts[6], 10);
    this.position.numSatellites = Number.parseInt(parts[7], 10);
  }

  parseNmeaCoordinate(value, hemisphere) {
    if (!value || !hemisphere) {
      return null;
    }

    const numeric = Number.parseFloat(value);
    if (!Number.isFinite(numeric)) {
      return null;
    }

    const degrees = Math.floor(numeric / 100);
    const minutes = numeric - (degrees * 100);
    let decimalDegrees = degrees + (minutes / 60);

    if (hemisphere === 'S' || hemisphere === 'W') {
      decimalDegrees *= -1;
    }

    return Number.isFinite(decimalDegrees) ? decimalDegrees : null;
  }
}

customElements.define("gc-gps-link", GCGPSLink);
