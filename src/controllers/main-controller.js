function cloneValue(value) {
    return structuredClone(value);
}

export class MainController extends EventTarget {
    constructor({ surveyModelUrl = `${import.meta.env.BASE_URL}data/SurveyModel.json`, appStore = null } = {}) {
        super();
        this.surveyModelUrl = surveyModelUrl;
        this.appStore = appStore;
        this.surveyModel = null;
        this.activeJobIndex = -1;
    }

    async loadSurveyModel(url = this.surveyModelUrl) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Unable to load survey model (${response.status})`);
        }

        const surveyModel = await response.json();
        this.validateSurveyModel(surveyModel);
        this.surveyModel = surveyModel;
        if (surveyModel.jobs.length > 0) {
            this.setActiveJob(0);
        }
        this.emitChange("survey-loaded");
        return this.getSurveyModel();
    }

    validateSurveyModel(surveyModel) {
        if (!surveyModel || typeof surveyModel !== "object" || Array.isArray(surveyModel)) {
            throw new Error("Survey model must be a JSON object");
        }

        if (!Array.isArray(surveyModel.jobs)) {
            throw new Error("Survey model must contain a jobs array");
        }

        surveyModel.jobs.forEach((job, index) => {
            if (!job || typeof job !== "object" || Array.isArray(job)) {
                throw new Error(`Job ${index} must be an object`);
            }
            if (!Array.isArray(job.measurements)) {
                throw new Error(`Job ${index} must contain a measurements array`);
            }
        });
    }

    setActiveJob(index) {
        this.assertSurveyLoaded();
        if (!Number.isInteger(index) || index < 0 || index >= this.surveyModel.jobs.length) {
            throw new RangeError(`Job index ${index} is out of range`);
        }

        this.activeJobIndex = index;
        this.appStore?.setActiveJob(index, this.surveyModel.jobs[index]);
        this.emitChange("active-job-changed");
        return this.getActiveJob();
    }

    getSurveyModel() {
        this.assertSurveyLoaded();
        return cloneValue(this.surveyModel);
    }

    getActiveJob() {
        this.assertSurveyLoaded();
        if (this.activeJobIndex < 0) {
            return null;
        }
        return cloneValue(this.surveyModel.jobs[this.activeJobIndex]);
    }

    addMeasurement(measurement) {
        this.assertSurveyLoaded();
        if (!measurement || typeof measurement !== "object" || Array.isArray(measurement)) {
            throw new TypeError("Measurement must be an object");
        }

        const activeJob = this.surveyModel.jobs[this.activeJobIndex];
        if (!activeJob) {
            throw new Error("Select an active job before adding a measurement");
        }

        const storedMeasurement = cloneValue(measurement);
        const measurementKey = this.getMeasurementKey(storedMeasurement);
        const existingIndex = activeJob.measurements.findIndex(
            (existing) => this.getMeasurementKey(existing) === measurementKey,
        );
        if (existingIndex >= 0) {
            activeJob.measurements[existingIndex] = storedMeasurement;
        } else {
            activeJob.measurements.push(storedMeasurement);
        }

        this.emitChange("measurement-saved", { measurement: storedMeasurement });
        return cloneValue(storedMeasurement);
    }

    getMeasurementKey(measurement) {
        return measurement?.step ?? measurement?.nr;
    }

    exportSurveyModel() {
        this.assertSurveyLoaded();
        return JSON.stringify(this.surveyModel, null, 2);
    }

    assertSurveyLoaded() {
        if (!this.surveyModel) {
            throw new Error("Load the survey model before accessing survey data");
        }
    }

    emitChange(type, detail = {}) {
        this.dispatchEvent(
            new CustomEvent("survey-state-change", {
                detail: {
                    type,
                    activeJobIndex: this.activeJobIndex,
                    ...detail,
                },
            }),
        );
    }
}