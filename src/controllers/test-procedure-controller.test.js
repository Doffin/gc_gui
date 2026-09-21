import { describe, expect, it } from "vitest";
import { TestProcedureController } from "./test-procedure-controller.js";

describe("TestProcedureController", () => {
    it("completes a passing procedure step and requests its target pressure", () => {
        let now = 0;
        const controller = new TestProcedureController({ now: () => now });
        const commands = [];
        const measurements = [];
        controller.addEventListener("command-requested", (event) => {
            commands.push(event.detail.command);
            event.detail.accepted = true;
        });
        controller.addEventListener("measurement-complete", (event) => measurements.push(event.detail.measurement));
        controller.setProcedure({
            content: [{ step: 0, phase: "Test", targetPressure: 10, vMax: 0.02, tMax: 60 }],
        });

        controller.start();
        controller.recordTargetRequested(10);
        now = 1000;
        controller.recordTargetReached({ targetPressure: 10, pressure: 10, force: 1, distance: 0 });
        now = 2000;
        controller.recordFastMeasurement({ pressure: 10, force: 1, distance: 0, velocity: 0.01 });
        now = 3000;
        controller.recordFastMeasurement({ pressure: 10, force: 1, distance: 0, velocity: 0.01 });
        now = 4000;
        controller.recordFastMeasurement({ pressure: 10, force: 1, distance: 0, velocity: 0.01 });

        expect(commands).toEqual(["pump:target=10"]);
        expect(measurements).toMatchObject([{ nr: 0, passed: true, velocity: 0.01 }]);
    });
});