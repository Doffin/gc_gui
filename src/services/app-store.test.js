import { describe, expect, it, vi } from "vitest";
import { AppStore } from "./app-store.js";

describe("AppStore", () => {
    it("retains procedures as immutable snapshots", () => {
        const store = new AppStore();
        const procedure = { content: [{ step: 0 }] };

        store.setProcedure(procedure);
        procedure.content[0].step = 99;

        expect(store.getProcedure()).toEqual({ content: [{ step: 0 }] });
    });

    it("upserts measurements by procedure step or result number", () => {
        const store = new AppStore();
        const listener = vi.fn();
        store.addEventListener("measurement-recorded", listener);

        store.addMeasurement({ nr: 1, passed: false });
        store.addMeasurement({ nr: 1, passed: true });

        expect(store.getMeasurements()).toEqual([{ nr: 1, passed: true }]);
        expect(listener).toHaveBeenCalledTimes(2);
    });
});