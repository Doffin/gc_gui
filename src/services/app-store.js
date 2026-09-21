export class AppStore extends EventTarget {
    constructor() {
        super();
        this.procedure = null;
        this.measurements = [];
        this.activeJobIndex = -1;
        this.activeJob = null;
        this.language = null;
    }

    setProcedure(procedure) {
        if (!procedure || typeof procedure !== "object" || Array.isArray(procedure)) {
            throw new TypeError("Procedure must be an object");
        }

        this.procedure = structuredClone(procedure);
        this.dispatchEvent(new CustomEvent("procedure-changed", {
            detail: { procedure: this.getProcedure() },
        }));
    }

    getProcedure() {
        return this.procedure ? structuredClone(this.procedure) : null;
    }

    setActiveJob(index, job) {
        if (!Number.isInteger(index) || index < 0) {
            throw new RangeError("Active job index must be a non-negative integer");
        }
        if (!job || typeof job !== "object" || Array.isArray(job)) {
            throw new TypeError("Active job must be an object");
        }

        this.activeJobIndex = index;
        this.activeJob = structuredClone(job);
        this.measurements = structuredClone(job.measurements || []);
        this.dispatchEvent(new CustomEvent("active-job-changed", {
            detail: { index, job: this.getActiveJob() },
        }));
        this.dispatchEvent(new CustomEvent("measurements-replaced", {
            detail: { measurements: this.getMeasurements() },
        }));
    }

    getActiveJob() {
        return this.activeJob ? structuredClone(this.activeJob) : null;
    }

    setLanguage(code, catalog) {
        const normalizedCode = String(code || "").trim().slice(0, 2).toLowerCase();
        if (!normalizedCode || !catalog || typeof catalog !== "object" || Array.isArray(catalog)) {
            throw new TypeError("Language requires a code and catalog object");
        }
        this.language = { code: normalizedCode, catalog: structuredClone(catalog) };
        this.dispatchEvent(new CustomEvent("language-changed", { detail: this.getLanguage() }));
    }

    getLanguage() {
        return this.language ? structuredClone(this.language) : null;
    }

    addMeasurement(measurement) {
        if (!measurement || typeof measurement !== "object" || Array.isArray(measurement)) {
            throw new TypeError("Measurement must be an object");
        }

        const storedMeasurement = structuredClone(measurement);
        const measurementKey = this.getMeasurementKey(storedMeasurement);
        const existingIndex = this.measurements.findIndex(
            (existing) => this.getMeasurementKey(existing) === measurementKey,
        );
        if (existingIndex >= 0) {
            this.measurements[existingIndex] = storedMeasurement;
        } else {
            this.measurements.push(storedMeasurement);
        }
        if (this.activeJob) {
            this.activeJob.measurements = structuredClone(this.measurements);
        }

        this.dispatchEvent(new CustomEvent("measurement-recorded", {
            detail: { measurement: structuredClone(storedMeasurement) },
        }));
    }

    getMeasurements() {
        return structuredClone(this.measurements);
    }

    getMeasurementKey(measurement) {
        return measurement?.step ?? measurement?.nr;
    }
}