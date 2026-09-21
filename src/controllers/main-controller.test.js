import { describe, expect, it, vi } from "vitest";
import { MainController } from "./main-controller.js";
import { AppStore } from "../services/app-store.js";

describe("MainController", () => {
    it("hydrates AppStore from the active job and persists measurements to that job", async () => {
        const appStore = new AppStore();
        const controller = new MainController({ appStore, surveyModelUrl: "/survey.json" });
        const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
            ok: true,
            json: async () => ({
                jobs: [
                    { jobName: "First", measurements: [{ step: 0, passed: false }] },
                    { jobName: "Second", measurements: [] },
                ],
            }),
        });

        await controller.loadSurveyModel();
        expect(appStore.getActiveJob()).toMatchObject({ jobName: "First" });
        expect(appStore.getMeasurements()).toEqual([{ step: 0, passed: false }]);

        controller.setActiveJob(1);
        controller.addMeasurement({ nr: 1, passed: true });

        expect(controller.getActiveJob().measurements).toEqual([{ nr: 1, passed: true }]);
        fetchMock.mockRestore();
    });

    it("restores nested test measurements and persists updates through its repository", async () => {
        const repository = {
            getSurvey: vi.fn().mockResolvedValue({
                activeJobIndex: 0,
                surveyModel: {
                    jobs: [{
                        jobName: "Nested test",
                        tests: [{ measurements: [{ step: 0, passed: false }] }],
                    }],
                },
            }),
            saveSurvey: vi.fn().mockResolvedValue(),
        };
        const controller = new MainController({ surveyRepository: repository });

        await controller.loadSurveyModel();
        controller.addMeasurement({ nr: 0, passed: true });
        await Promise.resolve();

        expect(controller.getActiveJob().tests[0].measurements).toEqual([{ nr: 0, passed: true }]);
        expect(repository.saveSurvey).toHaveBeenCalled();
    });
});