import { describe, expect, it, vi } from "vitest";
import { TransportService } from "./transport-service.js";

class FakeTransport extends EventTarget {
    constructor(state = "disconnected") {
        super();
        this.state = state;
        this.writeLine = vi.fn().mockResolvedValue();
    }

    getPortStatus() {
        return { state: this.state };
    }
}

describe("TransportService", () => {
    it("routes automatic commands to the first connected transport", async () => {
        const usb = new FakeTransport("connected");
        const ble = new FakeTransport("disconnected");
        const service = new TransportService({ transports: { usb, ble } });

        expect(service.sendCommand("pump=off")).toBe(true);
        await Promise.resolve();

        expect(usb.writeLine).toHaveBeenCalledWith("pump=off");
        expect(ble.writeLine).not.toHaveBeenCalled();
    });

    it("forwards link events with their transport name", () => {
        const usb = new FakeTransport("connected");
        const service = new TransportService({ transports: { usb } });
        const listener = vi.fn();
        service.addEventListener("serial-line", listener);

        usb.dispatchEvent(new CustomEvent("serial-line", { detail: { line: "$F,p:1" } }));

        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener.mock.calls[0][0].detail).toEqual({ transport: "usb", line: "$F,p:1" });
    });
});