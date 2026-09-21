export const TestProcedurePhase = Object.freeze({
    IDLE: 0,
    WAIT_FOR_TARGET_PRESSURE: 1,
    EVALUATE_Z_SPEED: 2,
    EVALUATION_PASSED: 3,
    EVALUATION_FAILED: 4,
    TEST_COMPLETED: 5,
});

export class TestProcedureController extends EventTarget {
    constructor({ now = () => Date.now() } = {}) {
        super();
        this.now = now;
        this.phase = TestProcedurePhase.IDLE;
        this.procedure = null;
        this.steps = [];
        this.stepIndex = -1;
        this.procedureRunning = false;
        this.velocity = 0;
        this.targetPressureReached = false;
        this.secondsElapsed = 0;
        this.secondsPause = 0;
        this.nextStateMachineUpdate = this.now() + 1000;
        this.testResult = this.createEmptyMeasurement();
    }

    setProcedure(procedure) {
        this.procedure = procedure;
    }

    start() {
        if (this.procedureRunning || this.phase !== TestProcedurePhase.IDLE) {
            throw new Error("A test is already running");
        }

        this.steps = this.normalizeSteps(this.procedure);
        this.stepIndex = -1;
        this.procedureRunning = true;
        this.startNextStep();
    }

    stop() {
        this.procedureRunning = false;
        this.steps = [];
        this.stepIndex = -1;
        this.phase = TestProcedurePhase.IDLE;
        this.secondsPause = 0;
        this.targetPressureReached = false;
        this.requestCommand("pump=off");
        this.emitStatus("TEST STOPPED");
    }

    recordFastMeasurement({ pressure, force, distance, velocity }) {
        if (Number.isFinite(velocity)) {
            this.velocity = velocity;
        }
        if (this.phase === TestProcedurePhase.EVALUATE_Z_SPEED && pressure > this.testResult.pressure) {
            this.testResult.pressure = pressure;
        }
        this.update();
    }

    recordTargetRequested(targetPressure) {
        if (!Number.isFinite(targetPressure)) {
            return;
        }
        this.testResult.targetPressure = targetPressure;
        this.testResult.dt = 0;
        this.phase = TestProcedurePhase.WAIT_FOR_TARGET_PRESSURE;
        this.emit("target-requested", { targetPressure });
        this.update();
    }

    recordTargetReached({ targetPressure, pressure, force, distance }) {
        if (!Number.isFinite(targetPressure)) {
            return;
        }
        this.testResult.targetPressure = targetPressure;
        this.testResult.pressure = pressure;
        this.testResult.force = force;
        this.testResult.distance = distance;
        this.targetPressureReached = true;
        this.emit("target-reached", { targetPressure, pressure, force, distance });
        this.update();
    }

    update() {
        if (this.now() < this.nextStateMachineUpdate) {
            return;
        }
        this.nextStateMachineUpdate = this.now() + 1000;
        if (this.secondsPause > 0) {
            this.secondsPause--;
            return;
        }

        switch (this.phase) {
            case TestProcedurePhase.WAIT_FOR_TARGET_PRESSURE:
                if (this.targetPressureReached) {
                    this.phase = TestProcedurePhase.EVALUATE_Z_SPEED;
                    this.testResult.hhmmss = new Date().toLocaleTimeString("en-GB");
                    this.secondsElapsed = 0;
                    this.secondsPause = 1;
                    this.emitStatus("TARGET PRESSURE REACHED");
                }
                break;
            case TestProcedurePhase.EVALUATE_Z_SPEED:
                this.testResult.velocity = this.velocity;
                this.testResult.dt = this.secondsElapsed;
                this.emitStatus(`EVAL v = ${this.velocity.toFixed(3)} mm/min [${this.secondsElapsed}/${this.testResult.tMax}]`);
                if (Math.abs(this.velocity) <= this.testResult.vMax) {
                    this.phase = TestProcedurePhase.EVALUATION_PASSED;
                }
                if (this.secondsElapsed >= this.testResult.tMax) {
                    this.phase = TestProcedurePhase.EVALUATION_FAILED;
                }
                this.secondsElapsed++;
                break;
            case TestProcedurePhase.EVALUATION_PASSED:
                this.completeMeasurement(true);
                break;
            case TestProcedurePhase.EVALUATION_FAILED:
                this.completeMeasurement(false);
                break;
            case TestProcedurePhase.TEST_COMPLETED:
                this.phase = TestProcedurePhase.IDLE;
                this.targetPressureReached = false;
                if (this.procedureRunning) {
                    this.startNextStep();
                } else {
                    this.secondsPause = 2;
                    this.emitStatus("TEST COMPLETED");
                }
                break;
        }
    }

    normalizeSteps(procedure) {
        const steps = Array.isArray(procedure?.content) ? procedure.content : [];
        const normalizedSteps = steps.map((step, index) => {
            const targetPressure = this.parseNumber(step.targetPressure);
            const vMax = this.parseNumber(step.vMax);
            const tMax = this.parseNumber(step.tMax);
            if (targetPressure === null || vMax === null || tMax === null || tMax < 0) {
                throw new Error(`Invalid values in procedure step ${step.step ?? index}`);
            }
            return { ...step, targetPressure, vMax, tMax };
        });

        if (normalizedSteps.length === 0) {
            throw new Error("The procedure contains no measurement steps");
        }
        return normalizedSteps;
    }

    startNextStep() {
        this.stepIndex++;
        if (this.stepIndex >= this.steps.length) {
            this.procedureRunning = false;
            this.emitStatus("TEST PROCEDURE COMPLETED");
            this.emit("procedure-complete");
            return;
        }

        const step = this.steps[this.stepIndex];
        this.secondsElapsed = 0;
        this.secondsPause = 0;
        this.targetPressureReached = false;
        this.testResult = {
            nr: step.step ?? this.stepIndex,
            name: step.phase || `Step ${this.stepIndex + 1}`,
            targetPressure: step.targetPressure,
            pressure: 0,
            force: 0,
            distance: 0,
            velocity: 0,
            vMax: step.vMax,
            dt: 0,
            tMax: step.tMax,
            hhmmss: "00:00:00",
            passed: false,
        };
        this.emit("step-started", { step: this.testResult, stepIndex: this.stepIndex, stepCount: this.steps.length });
        this.emitStatus(`STEP ${this.stepIndex + 1}/${this.steps.length}: REQUEST ${step.targetPressure} kPa`);
        if (!this.requestCommand(`pump:target=${step.targetPressure}`)) {
            this.procedureRunning = false;
            this.emitStatus("TEST STOPPED: COMMAND COULD NOT BE SENT");
            this.emit("procedure-complete");
        }
    }

    completeMeasurement(passed) {
        this.testResult.velocity = this.velocity;
        this.testResult.dt = this.secondsElapsed;
        this.testResult.passed = passed;
        const comparison = passed ? "<" : ">";
        const outcome = passed ? "PASS" : "FAIL";
        this.emit("measurement-complete", { measurement: structuredClone(this.testResult) });
        this.emitStatus(`${outcome} ${this.velocity.toFixed(3)} ${comparison} ${this.testResult.vMax} mm/min after ${this.secondsElapsed} s`);
        this.phase = TestProcedurePhase.TEST_COMPLETED;
        this.secondsPause = 4;
        if (passed && this.stepIndex === 1) {
            this.requestCommand("distance=zero\r\n");
            this.emit("distance-reset-requested");
        }
    }

    requestCommand(command) {
        const detail = { command, accepted: false };
        this.emit("command-requested", detail);
        return detail.accepted;
    }

    emitStatus(message) {
        this.emit("status", { message });
    }

    emit(type, detail = {}) {
        this.dispatchEvent(new CustomEvent(type, { detail }));
    }

    createEmptyMeasurement() {
        return {
            nr: 1,
            name: "Forbelastning",
            targetPressure: 0,
            pressure: 0,
            force: 0,
            distance: 0,
            velocity: 0,
            vMax: 0.02,
            dt: 0,
            tMax: 60,
            hhmmss: "00:00:00",
            passed: false,
        };
    }

    parseNumber(value) {
        const numeric = Number.parseFloat(value);
        return Number.isFinite(numeric) ? numeric : null;
    }
}