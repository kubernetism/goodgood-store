import { describe, expect, it } from "vitest";
import { prefillOrderNumber, TRACKING_NOT_FOUND, trackingSteps, validateTrackingInput } from "./model";

describe("validateTrackingInput", () => {
  it("normalises the order number and the Pakistani mobile number", () => {
    expect(validateTrackingInput({ order: "as-1001", phone: "0300 123 4567" })).toEqual({ ok: true, data: { number: 1001, phone: "+923001234567" } });
    expect(validateTrackingInput({ order: "#1002", phone: "+92 300 1234567" })).toEqual({ ok: true, data: { number: 1002, phone: "+923001234567" } });
  });
  it("explains missing and malformed fields", () => {
    const empty = validateTrackingInput({ order: "", phone: "" });
    expect(empty.ok).toBe(false);
    if (!empty.ok) expect(Object.keys(empty.fieldErrors).sort()).toEqual(["order", "phone"]);
    const bad = validateTrackingInput({ order: "AS-1001", phone: "12345" });
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.fieldErrors).toEqual({ phone: "Enter a Pakistani mobile number, e.g. 0300 1234567." });
  });
  it("rejects over-long input before parsing", () => {
    expect(validateTrackingInput({ order: "1".repeat(21), phone: "03001234567" }).ok).toBe(false);
    expect(validateTrackingInput({ order: "AS-1001", phone: "0".repeat(26) }).ok).toBe(false);
  });
  it("uses one message for a wrong number and a wrong phone", () => {
    expect(TRACKING_NOT_FOUND).not.toMatch(/phone does not|number does not/i);
  });
});

describe("prefillOrderNumber", () => {
  it("accepts a valid ?order= and formats it", () => {
    expect(prefillOrderNumber("AS-1005")).toBe("AS-1005");
    expect(prefillOrderNumber("1005")).toBe("AS-1005");
  });
  it("drops anything else", () => {
    expect(prefillOrderNumber(undefined)).toBe("");
    expect(prefillOrderNumber("<script>")).toBe("");
  });
});

describe("trackingSteps", () => {
  const placedAt = "2026-10-30T05:00:00.000Z";
  it("marks reached stages done, the current one current, and the rest to do", () => {
    const steps = trackingSteps("packed", placedAt, [
      { fromStatus: null, toStatus: "pending", at: placedAt },
      { fromStatus: "pending", toStatus: "confirmed", at: "2026-10-30T06:00:00.000Z" },
      { fromStatus: "confirmed", toStatus: "packed", at: "2026-10-30T07:00:00.000Z" },
    ]);
    expect(steps.map((step) => step.state)).toEqual(["done", "done", "current", "todo", "todo", "todo"]);
    expect(steps[1]?.at).toBe("2026-10-30T06:00:00.000Z");
    expect(steps[3]?.at).toBeNull();
    expect(steps.map((step) => step.label)).toEqual(["Order placed", "Confirmed", "Packed", "With the courier", "On the way", "Delivered"]);
  });
  it("completes every stage when delivered, even for orders older than the new stages", () => {
    const steps = trackingSteps("delivered", placedAt, [{ fromStatus: "shipped", toStatus: "delivered", at: "2026-10-31T05:00:00.000Z" }]);
    expect(steps.every((step) => step.state === "done")).toBe(true);
    expect(steps[2]?.at).toBeNull();
  });
  it("shows a cancelled order's stages up to where it was cancelled", () => {
    const steps = trackingSteps("cancelled", placedAt, [{ fromStatus: "confirmed", toStatus: "cancelled", at: "2026-10-30T08:00:00.000Z" }]);
    expect(steps.map((step) => step.state)).toEqual(["done", "done", "todo", "todo", "todo", "todo"]);
  });
});
