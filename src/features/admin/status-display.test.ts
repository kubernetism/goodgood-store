import { describe, expect, it } from "vitest";
import { bannerScheduleStatus, canCancel, forwardStatus, hexLevel, orderStatusTabs, statusActionLabel, stockLevel } from "./status-display";

describe("hexLevel", () => {
  it("fills the cell as an order moves forward and strikes cancelled", () => {
    expect(hexLevel("pending")).toEqual({ level: 0, struck: false });
    expect(hexLevel("confirmed")).toEqual({ level: 1, struck: false });
    expect(hexLevel("shipped")).toEqual({ level: 2, struck: false });
    expect(hexLevel("delivered")).toEqual({ level: 3, struck: false });
    expect(hexLevel("cancelled")).toEqual({ level: 0, struck: true });
  });
});

describe("order status buttons", () => {
  it("offers exactly one forward step per open status", () => {
    expect(forwardStatus("pending")).toBe("confirmed");
    expect(forwardStatus("confirmed")).toBe("shipped");
    expect(forwardStatus("shipped")).toBe("delivered");
  });
  it("offers nothing for finished orders", () => {
    expect(forwardStatus("delivered")).toBeNull();
    expect(forwardStatus("cancelled")).toBeNull();
  });
  it("keeps cancel separate and only for open orders", () => {
    expect(["pending", "confirmed", "shipped"].map((status) => canCancel(status as "pending"))).toEqual([true, true, true]);
    expect(canCancel("delivered")).toBe(false);
    expect(canCancel("cancelled")).toBe(false);
  });
  it("labels buttons with verbs", () => {
    expect(statusActionLabel("confirmed")).toBe("Mark as confirmed");
    expect(statusActionLabel("shipped")).toBe("Mark as shipped");
    expect(statusActionLabel("delivered")).toBe("Mark as delivered");
  });
  it("orders tabs by lifecycle with cancelled last", () => {
    expect(orderStatusTabs).toEqual(["pending", "confirmed", "shipped", "delivered", "cancelled"]);
  });
});

describe("bannerScheduleStatus", () => {
  const now = new Date("2026-10-31T12:00:00Z");
  const at = (iso: string) => new Date(iso);
  it("is off whenever the switch is off", () => {
    expect(bannerScheduleStatus({ isActive: false, startsAt: null, endsAt: null }, now)).toBe("off");
  });
  it("is live with no window or inside the window", () => {
    expect(bannerScheduleStatus({ isActive: true, startsAt: null, endsAt: null }, now)).toBe("live");
    expect(bannerScheduleStatus({ isActive: true, startsAt: at("2026-10-30T00:00:00Z"), endsAt: at("2026-11-01T00:00:00Z") }, now)).toBe("live");
  });
  it("is scheduled before the start and ended at or after the end", () => {
    expect(bannerScheduleStatus({ isActive: true, startsAt: at("2026-11-01T00:00:00Z"), endsAt: null }, now)).toBe("scheduled");
    expect(bannerScheduleStatus({ isActive: true, startsAt: null, endsAt: now }, now)).toBe("ended");
  });
});

describe("stockLevel", () => {
  it("flags out and low stock at the dashboard threshold", () => {
    expect(stockLevel(0)).toBe("out");
    expect(stockLevel(-1)).toBe("out");
    expect(stockLevel(5)).toBe("low");
    expect(stockLevel(6)).toBe("ok");
  });
});
