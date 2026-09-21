function cloneValue(value) {
    return structuredClone(value);
}

export class MainController extends EventTarget {
    constructor({ surveyModelUrl = `${import.meta.env.BASE_URL}data/SurveyModel.json`, appStore = null, surveyRepository = null } = {}) {
        super();
        this.surveyModelUrl = surveyModelUrl;
        this.appStore = appStore;
        this.surveyRepository = surveyRepository;
        this.surveyModel = null;
        this.activeJobIndex = -1;
    }

    async loadSurveyModel(url = this.surveyModelUrl) {
        let persistedSurvey = null;
        try {
            persistedSurvey = await this.surveyRepository?.getSurvey();
        } catch (error) {
            console.warn("Unable to restore the persisted survey:", error);
        }

        let surveyModel = persistedSurvey?.surveyModel;
        if (!surveyModel) {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Unable to load survey model (${response.status})`);
            }
            surveyModel = await response.json();
        }

        this.validateSurveyModel(surveyModel);
        this.surveyModel = surveyModel;
        if (surveyModel.jobs.length > 0) {
            const storedIndex = persistedSurvey?.activeJobIndex;
            const activeJobIndex = Number.isInteger(storedIndex) && storedIndex >= 0 && storedIndex < surveyModel.jobs.length
                ? storedIndex
                : 0;
            this.setActiveJob(activeJobIndex, { persist: false });
        }
        this.emitChange("survey-loaded");
        if (!persistedSurvey) this.persistSurvey();
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
            const hasJobMeasurements = Array.isArray(job.measurements);
            const hasTestMeasurements = Array.isArray(job.tests)
                && job.tests.every((test) => test && typeof test === "object" && Array.isArray(test.measurements));
            if (!hasJobMeasurements && !hasTestMeasurements) {
                throw new Error(`Job ${index} must contain measurements or tests with measurements`);
            }
        });
    }

    setActiveJob(index, { persist = true } = {}) {
        this.assertSurveyLoaded();
        if (!Number.isInteger(index) || index < 0 || index >= this.surveyModel.jobs.length) {
            throw new RangeError(`Job index ${index} is out of range`);
        }

        this.activeJobIndex = index;
        const activeJob = this.surveyModel.jobs[index];
        this.appStore?.setActiveJob(index, {
            ...activeJob,
            measurements: this.getActiveMeasurements(),
        });
        this.emitChange("active-job-changed");
        if (persist) this.persistSurvey();
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

        const measurements = this.getActiveMeasurements();
        if (!measurements) {
            throw new Error("Select an active job before adding a measurement");
        }

        const storedMeasurement = cloneValue(measurement);
        const measurementKey = this.getMeasurementKey(storedMeasurement);
        const existingIndex = measurements.findIndex(
            (existing) => this.getMeasurementKey(existing) === measurementKey,
        );
        if (existingIndex >= 0) {
            measurements[existingIndex] = storedMeasurement;
        } else {
            measurements.push(storedMeasurement);
        }

        this.emitChange("measurement-saved", { measurement: storedMeasurement });
        this.persistSurvey();
        return cloneValue(storedMeasurement);
    }

    getActiveMeasurements() {
        const activeJob = this.surveyModel?.jobs?.[this.activeJobIndex];
        if (!activeJob) return null;
        if (Array.isArray(activeJob.measurements)) return activeJob.measurements;
        return activeJob.tests?.[0]?.measurements || null;
    }

    getMeasurementKey(measurement) {
        return measurement?.step ?? measurement?.nr;
    }

    exportSurveyModel() {
        this.assertSurveyLoaded();
        return JSON.stringify(this.surveyModel, null, 2);
    }

    async resetSurveyModel() {
        try {
            await this.surveyRepository?.clearSurvey();
        } catch (error) {
            console.warn("Unable to clear the persisted survey:", error);
        }
        this.surveyModel = null;
        this.activeJobIndex = -1;
        return this.loadSurveyModel();
    }

    persistSurvey() {
        if (!this.surveyRepository || !this.surveyModel) return;
        this.surveyRepository.saveSurvey(this.surveyModel, this.activeJobIndex).catch((error) => {
            console.warn("Unable to persist the survey:", error);
        });
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