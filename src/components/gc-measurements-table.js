import { GCTable } from "./gc-table.js";

class GCMeasurementsTable extends GCTable {
    constructor() {
        super();
        this.onProcedureStoreChange = this.onProcedureStoreChange.bind(this);
        this.onMeasurementStoreChange = this.onMeasurementStoreChange.bind(this);
        this.appStore = null;
        const summary = {};
        this.summary = summary;
    }

    setAppStore(appStore) {
        if (!appStore || typeof appStore.getProcedure !== "function" || typeof appStore.getMeasurements !== "function") {
            throw new TypeError("appStore must provide procedure and measurement accessors");
        }
        this.appStore = appStore;
        if (this.isConnected) {
            this.appStore.addEventListener("procedure-changed", this.onProcedureStoreChange);
            this.appStore.addEventListener("measurement-recorded", this.onMeasurementStoreChange);
            this.syncProcedureFromStore();
            this.syncMeasurementsFromStore();
        }
    }

    connectedCallback() {
        super.connectedCallback();
        this.appStore?.addEventListener("procedure-changed", this.onProcedureStoreChange);
        this.appStore?.addEventListener("measurement-recorded", this.onMeasurementStoreChange);
        this.syncProcedureFromStore();
        this.syncMeasurementsFromStore();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.appStore?.removeEventListener("procedure-changed", this.onProcedureStoreChange);
        this.appStore?.removeEventListener("measurement-recorded", this.onMeasurementStoreChange);
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

    renderMeasurement(measurement) {
        let rowData = [];
        rowData[0] = measurement.nr;
        rowData[1] = measurement.name;
        rowData[2] = measurement.targetPressure.toFixed(1);
        rowData[3] = measurement.pressure.toFixed(1);
        rowData[4] = measurement.distance.toFixed(3);
        rowData[5] = measurement.velocity.toFixed(3);
        rowData[6] = measurement.hhmmss;
        rowData[7] = (measurement.passed==true)? "PASS" : "FAIL";
        this.updateRowData(measurement.nr,rowData);
        this.render();
    }

    async onProcedureStoreChange(event) {
        await this.applyTestProcedureChange(event.detail.procedure);
    }

    onMeasurementStoreChange(event) {
        this.renderMeasurement(event.detail.measurement);
    }

    async syncProcedureFromStore() {
        const procedure = this.appStore?.getProcedure();
        if (procedure) {
            await this.applyTestProcedureChange(procedure);
        }
    }

    syncMeasurementsFromStore() {
        this.appStore?.getMeasurements().forEach((measurement) => this.renderMeasurement(measurement));
    }

    async applyTestProcedureChange(testProcedure) {
        const measurement = {};
        measurement.nr    = 0;
        measurement.name  ="Test";
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
        this.summary.delta1 = testProcedure.delta1;
        this.summary.delta2 = testProcedure.delta2;
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

    calculateSummaryResults() {
        // Implement the logic to calculate summary results for the measurements table
        /*
        Fra kurven for første gang belastning blir E1-verdien regnet ut på følgende måte: 
        Først bestemmes de punkter på kurven som tilsvarer 0,3 og 0,7 av maksimalbelastningen. 
        Ved en totalbelastning på 600 kN/m2 tas setningen s1 ved 180 og s2 ved 420 kN/m2 
        (hhv. 0,3 og 0,7 av totalbelastningen). 
        ∆p=p2-p1 (kN/m2) 
        ∆s=s2-s1 (kN/m) 
        Verdiene settes inn i følgende formelen: 
        𝐸 = 0,75 ∙(Δ𝑝/Δ𝑠) ∙𝐷
        hvor D er diameteren på trykkplaten som brukes under testprosedyren.
        Fra kurven for andre gangs belastning, tas setningsverdien ut mellom det andre belastningstrinnet 180 
        kN/m2 og det høyeste belastningstrinnet hvor kurven er tilnærmet rettlinjet. E2-verdien beregnes på samme 
        måte som E1-verdien. Verdien E2/E1 beregnes og oppgis med en desimal. Grenseverdier og krav finnes i Normal N200.  
        */
        // In stead of calculating the index of p1,p2 we will read the values from the testProcedure.
        // We will use the delta1 and delta2 values from the testProcedure to determine the indices for E1 and E2 calculations.
        let maxLoad = Math.max(...this.measurements.map(m => m.targetPressure)); //max value 
        let D  = 0.3;   // Diameter of pressureplate used during test procedure 
        let p1Index1 = this.summary.delta1.p1Index;
        let p2Index1 = this.summary.delta1.p2Index;
        let p1_1 = this.measurements[p1Index1].targetPressure;
        let p2_1 = this.measurements[p2Index1].targetPressure;
        let s1_1 = this.measurements[p1Index1].distance;
        let s2_1 = this.measurements[p2Index1].distance;
        let dp1 = p2_1 - p1_1;
        let ds1 = s2_1 - s1_1;
        let E1 = 0.75 * (dp1 / ds1) * D;
        let p1Index2 = this.summary.delta2.p1Index;
        let p2Index2 = this.summary.delta2.p2Index;
        let p1_2 = this.measurements[p1Index2].targetPressure;
        let p2_2 = this.measurements[p2Index2].targetPressure;
        let s1_2 = this.measurements[p1Index2].distance;
        let s2_2 = this.measurements[p2Index2].distance;
        let dp2 = p2_2 - p1_2;
        let ds2 = s2_2 - s1_2;
        let E2 = 0.75 * (dp2 / ds2) * D;
        console.log(`E1 calculation: dp1=${dp1}, ds1=${ds1}, D=${D}, E1=${E1}`);
        console.log(`E2 calculation: dp2=${dp2}, ds2=${ds2}, D=${D}, E2=${E2}`);
        console.log(`E ratio calculation: E2/E1=${E2 / E1}`);

        return { E1, E2, ratio: E2 / E1 };
    }

}

customElements.define("gc-measurements-table", GCMeasurementsTable);

export { GCMeasurementsTable };
