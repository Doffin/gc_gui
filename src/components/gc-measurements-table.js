import { GCTable } from "./gc-table.js";

class GCMeasurementsTable extends GCTable {
    constructor() {
        super();
        this.onTestMeasurement = this.onTestMeasurement.bind(this);
        this.onTestProcedureChange = this.onTestProcedureChange.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();
        document.addEventListener("test-procedure-change", this.onTestProcedureChange);
        document.addEventListener("test-measurement", this.onTestMeasurement);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener("test-procedure-change", this.onTestProcedureChange);
        document.removeEventListener("test-measurement", this.onTestMeasurement);
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
        // find this row in the table by measurement.targetPressure
        let rowData = [];
        let rowIndex = this.findRowIndexByTargetPressure(measurement.targetPressure);
        console.log("Row index found:", rowIndex);
        if(rowIndex === -1) return;
        let originalRowData = this.parseMeasurementRowData(rowIndex);
        rowData[0] = originalRowData.nr;
        rowData[1] = originalRowData.name;
        rowData[2] = measurement.targetPressure.toFixed(1);
        rowData[3] = measurement.pressure.toFixed(1);
        rowData[4] = measurement.distance.toFixed(3);
        rowData[5] = measurement.velocity.toFixed(3);
        rowData[6] = measurement.hhmmss;
        rowData[7] = (measurement.passed==true)? "PASS" : "FAIL";
        this.updateRowData(rowIndex,rowData);
        this.render();
    }

    async onTestProcedureChange(event) {
        const detail = event?.detail;
        const testProcedure = detail?.testProcedure;
        if (testProcedure) {
            await this.applyTestProcedureChange(testProcedure);
        }
    }

    async applyTestProcedureChange(testProcedure) {
        const measurement = {};
        measurement.nr   = 0;
        measurement.name ="Test";
        measurement.targetPressure = 0.0;    // The pressure we wanted to have tested
        measurement.pressure = 0.0;          // Actual pressure at t0
        measurement.force = 0.0;          // Force applied to pressure plate
        measurement.distance = 0.0;          // Ground z-distance at t0
        measurement.velocity = 0.0;          // Settling speed at end of test in mm/min
        measurement.vMax = 0.02;         // Max accepatble ground speed.
        measurement.dt = 0;            // Duration of test evaluation in seconds
        measurement.tMax = 60;           // Max duration of evaluatiuon period in seconds
        measurement.hhmmss = "00:00:00";   // Clock at start of test
        measurement.passed = false;        // Is ground speed below threshold
        let testRows = testProcedure.content;
        let rowData = [];

        testRows.forEach(newRow => {
            rowData[0] = newRow.step;
            rowData[1] = newRow.phase;
            rowData[2] = newRow.targetPressure.toFixed(1);
            rowData[3] = measurement.pressure.toFixed(1);
            rowData[4] = measurement.distance.toFixed(3);
            rowData[5] = newRow.vMax;
            rowData[6] = newRow.tMax;
            rowData[7] = "?";
            this.updateRowData(newRow.step,rowData);
            //console.log(`Row ${newRow.step} ${newRow.phase}`);
        });

    }
    findRowIndexByTargetPressure(targetPressure) {
        let toFind = parseFloat(targetPressure.toFixed(1));
        let max = this.getRowCount();
        for (let i = 0; i < max; i++) {
            // Use the PASS/FAIL column to see if this row already has been updated.
            // Skip rows that have already been updated.
//            if(this.getTableRow(i).children[8]?.textContent === "?") {
                let tr = this.parseMeasurementRowData(i);
                if (Math.abs(tr.targetPressure - toFind) < 0.05) {
                    return i;
                }
//            }
        }
        return -1;
    }

    parseMeasurementRowData(rowIndex) {
        let rd = this.getTableRow(rowIndex).children;
        let measurement = {
            nr: rd[0].textContent,
            name: rd[1].textContent,
            targetPressure: parseFloat(rd[2].textContent),
            pressure: parseFloat(rd[3].textContent),
            distance: parseFloat(rd[4].textContent),
            velocity: parseFloat(rd[5].textContent),
            vMax: parseFloat(rd[6].textContent),
            tMax: parseFloat(rd[7].textContent),
            passed: rd[8]?.textContent === "PASS"
        };
        return measurement;
    }

}

customElements.define("gc-measurements-table", GCMeasurementsTable);

export { GCMeasurementsTable };
