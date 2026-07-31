import { GCTable } from "./gc-table.js";

class GCMeasurementsTable extends GCTable {
    constructor() {
        super();
        this.shadowRoot.getElementById('available').innerHTML= `<gc-procedure-bar></gc-procedure-bar>`;
        this.onTestMeasurement = this.onTestMeasurement.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();
        document.addEventListener("test-measurement", this.onTestMeasurement);
    }

    /*
        const testResult = {};
        testResult.nr   = 1;                // Test number
        testResult.name = "Forbelastning";  // Name of the measurement
        testResult.targetPressure = 0.0;    // The pressure we wanted to have tested
        testResult.pressure = 0.0;          // Actual pressure at t0
        testResult.force = 0.0;             // Force applied to pressure plate
        testResult.distance = 0.0;          // Ground z-distance at t0
        testResult.velocity = 0.0;          // Settling speed at end of test in mm/min
        testResult.vMax = 0.02;             // Max accepatble ground speed.
        testResult.dt = 0;                  // Duration of test evaluation in seconds
        testResult.tMax = 60;               // Max duration of evaluatiuon period in seconds
        testResult.hhmmss = "00:00:00";     // Clock at start of test
        testResult.passed = false;          // Is ground speed below threshold
    */
    async onTestMeasurement(event) {
        const detail = event?.detail;
        const measurement = detail.measurement;        
        console.log("New test-measurement "+measurement.targetPressure);
        let rowData = [];
        rowData[0] = measurement.nr;
        rowData[1] = measurement.name;
        rowData[2] = measurement.targetPressure.toFixed(1);
        rowData[3] = measurement.pressure.toFixed(1);
        rowData[4] = measurement.distance.toFixed(3);
        rowData[5] = measurement.velocity.toFixed(3);
        rowData[6] = measurement.hhmmss;
        rowData[7] = (measurement.passed==true)? "PASS" : "FAIL";
        if(measurement.nr>0)
           this.updateRowData(measurement.nr-1,rowData);
        if(measurement.nr==0)
           this.updateRowData(measurement.nr,rowData);
        this.render();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener("test-measurement", this.onTestMeasurement);
    }

}

customElements.define("gc-measurements-table", GCMeasurementsTable);

export { GCMeasurementsTable };
