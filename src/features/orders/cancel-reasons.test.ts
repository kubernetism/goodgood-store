import { describe, expect, it } from "vitest";
import { cancelReasonForCustomer, cancelReasonLabel, cancelReasons, validateCancellation, validateCourier } from "./cancel-reasons";

describe("validateCancellation", () => {
  it("requires a known reason", () => {
    expect(validateCancellation({ reason: "", note: "" })).toEqual({ ok: false, error: "Choose why this order is being cancelled." });
    expect(validateCancellation({ reason: "bored", note: "" }).ok).toBe(false);
  });
  it("accepts a reason without a note", () => {
    expect(validateCancellation({ reason: "fake_order", note: "  " })).toEqual({ ok: true, data: { reason: "fake_order", note: null } });
  });
  it("requires a note when the reason is Other", () => {
    expect(validateCancellation({ reason: "other", note: "" })).toEqual({ ok: false, error: "Describe the reason when choosing Other." });
    expect(validateCancellation({ reason: "other", note: "  Moved\n abroad " })).toEqual({ ok: true, data: { reason: "other", note: "Moved abroad" } });
  });
  it("caps the note length", () => {
    expect(validateCancellation({ reason: "other", note: "x".repeat(301) }).ok).toBe(false);
    expect(validateCancellation({ reason: "other", note: "x".repeat(300) }).ok).toBe(true);
  });
});

describe("cancel reason wording", () => {
  it("labels every reason for the admin and the customer", () => {
    for (const reason of cancelReasons) {
      expect(cancelReasonLabel(reason.value)).toBeTruthy();
      expect(cancelReasonForCustomer(reason.value)).toBe(reason.customer);
    }
    expect(cancelReasonLabel("other")).toBe("Other");
    expect(cancelReasonLabel(null)).toBeNull();
  });
  it("never shows internal wording such as 'fake' to customers", () => {
    expect(cancelReasonForCustomer("fake_order")).not.toMatch(/fake/i);
    expect(cancelReasonForCustomer(null)).toMatch(/contact us/);
  });
});

describe("validateCourier", () => {
  it("allows both fields to be empty", () => {
    expect(validateCourier({ courierName: " ", trackingNumber: "" })).toEqual({ ok: true, data: { courierName: null, trackingNumber: null } });
  });
  it("trims the name and strips spaces from the tracking number", () => {
    expect(validateCourier({ courierName: " Leopards  Courier ", trackingNumber: " LE 123-45/6 " })).toEqual({ ok: true, data: { courierName: "Leopards Courier", trackingNumber: "LE123-45/6" } });
  });
  it("rejects odd characters and over-long values", () => {
    expect(validateCourier({ courierName: "TCS", trackingNumber: "<script>" }).ok).toBe(false);
    expect(validateCourier({ courierName: "x".repeat(61), trackingNumber: "" }).ok).toBe(false);
  });
});
