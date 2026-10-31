import { describe, expect, it } from "vitest";
import { defaultOrderDateMode, parseOrderDateFilter } from "./date-filter";

describe("order date filter", () => {
  it("defaults to the current Pakistan day even when UTC is still the previous day", () => {
    const filter = parseOrderDateFilter({}, new Date("2026-10-29T20:30:00Z"));
    expect(filter).toMatchObject({ mode: "today", from: "2026-10-30", to: "2026-10-30", error: null });
    expect(filter.start?.toISOString()).toBe("2026-10-29T19:00:00.000Z");
    expect(filter.end?.toISOString()).toBe("2026-10-30T19:00:00.000Z");
  });

  it("does not limit dates when all dates are selected", () => {
    expect(parseOrderDateFilter({ date: "all" }, new Date("2026-10-30T12:00:00Z"))).toMatchObject({ mode: "all", start: null, end: null, error: null });
  });

  it("includes both days of a custom range through the next Pakistan midnight", () => {
    const filter = parseOrderDateFilter({ date: "range", from: "2024-02-28", to: "2024-02-29" });
    expect(filter.start?.toISOString()).toBe("2024-02-27T19:00:00.000Z");
    expect(filter.end?.toISOString()).toBe("2024-02-29T19:00:00.000Z");
    expect(filter.error).toBeNull();
  });

  it("reports missing, impossible, and reversed dates without creating an unrestricted query", () => {
    for (const params of [
      { date: "range", from: "2026-10-01", to: "" },
      { date: "range", from: "2026-02-30", to: "2026-03-01" },
      { date: "range", from: "2026-10-31", to: "2026-10-01" },
      { date: "invalid" },
    ]) {
      const filter = parseOrderDateFilter(params);
      expect(filter.error).toBeTruthy();
      expect(filter.start).toBeNull();
      expect(filter.end).toBeNull();
    }
  });

  it("defaults open statuses to all dates and finished statuses to today (O1)", () => {
    expect(defaultOrderDateMode("pending")).toBe("all");
    expect(defaultOrderDateMode("confirmed")).toBe("all");
    expect(defaultOrderDateMode("shipped")).toBe("all");
    expect(defaultOrderDateMode("delivered")).toBe("today");
    expect(defaultOrderDateMode("cancelled")).toBe("today");
  });

  it("uses the caller's default when no date is given, so older pending orders stay visible", () => {
    expect(parseOrderDateFilter({}, new Date("2026-10-30T12:00:00Z"), "all")).toMatchObject({ mode: "all", start: null, end: null, error: null });
    expect(parseOrderDateFilter({ date: "today" }, new Date("2026-10-30T12:00:00Z"), "all")).toMatchObject({ mode: "today", error: null });
  });
});

