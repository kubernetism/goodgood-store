import { describe, expect, it } from "vitest";
import { barPercent, dashboardHref, formatDaySpan, formatPktLongDay, formatRatio, formatShare, outcomeRatios, parseDashboardRange, parseProductSort } from "./dashboard-stats";

// 31 Oct 2026, 02:30 PKT (still 30 Oct in UTC): ranges must follow Pakistan's calendar.
const now = new Date("2026-10-30T21:30:00Z");

describe("parseDashboardRange", () => {
  it("defaults to all time (total sales) and ignores unknown values", () => {
    expect(parseDashboardRange(undefined, now).key).toBe("all");
    expect(parseDashboardRange("forever", now).key).toBe("all");
  });
  it("starts today at PKT midnight", () => {
    const range = parseDashboardRange("today", now);
    expect(range.start?.toISOString()).toBe("2026-10-30T19:00:00.000Z");
    expect(range.orderDateQuery.toString()).toBe("date=today");
  });
  it("covers whole PKT days ending today, inclusive", () => {
    const range = parseDashboardRange("7d", now);
    expect(range.start?.toISOString()).toBe("2026-10-24T19:00:00.000Z");
    expect(range.orderDateQuery.toString()).toBe("date=range&from=2026-10-25&to=2026-10-31");
    expect(range.phrase).toBe("in the last 7 days");
  });
  it("has no start for all time", () => {
    const range = parseDashboardRange("all", now);
    expect(range.start).toBeNull();
    expect(range.orderDateQuery.toString()).toBe("date=all");
  });
});

describe("outcomeRatios", () => {
  it("divides by delivered plus cancelled only", () => {
    expect(outcomeRatios(3, 1)).toEqual({ success: 0.75, fail: 0.25 });
    expect(outcomeRatios(5, 0)).toEqual({ success: 1, fail: 0 });
  });
  it("is empty, not zero, when nothing has finished", () => {
    expect(outcomeRatios(0, 0)).toEqual({ success: null, fail: null });
  });
});

describe("formatRatio", () => {
  it("rounds to one decimal and drops .0", () => {
    expect(formatRatio(2 / 3)).toBe("66.7%");
    expect(formatRatio(1)).toBe("100%");
    expect(formatRatio(0)).toBe("0%");
    expect(formatRatio(null)).toBe("–");
  });
});

describe("product table helpers", () => {
  it("sorts by units unless revenue is asked for", () => {
    expect(parseProductSort(undefined)).toBe("units");
    expect(parseProductSort("revenue")).toBe("revenue");
    expect(parseProductSort("price")).toBe("units");
  });
  it("sizes bars against the largest value", () => {
    expect(barPercent(50, 100)).toBe(50);
    expect(barPercent(1, 1000)).toBe(2);
    expect(barPercent(0, 100)).toBe(0);
    expect(barPercent(5, 0)).toBe(0);
  });
  it("builds dashboard links that keep the other parameters and drop defaults", () => {
    const current = { range: "7d", sort: "revenue", page: 2 } as const;
    expect(dashboardHref(current, { page: 3 })).toBe("/admin?range=7d&psort=revenue&ppage=3");
    expect(dashboardHref(current, { range: "all", page: 1 })).toBe("/admin?psort=revenue");
    expect(dashboardHref({ range: "all", sort: "units", page: 1 }, {})).toBe("/admin");
  });
});

describe("range captions", () => {
  it("names the PKT days each range covers", () => {
    expect(parseDashboardRange("today", now).caption).toBe("today · 31 Oct (PKT)");
    expect(parseDashboardRange("7d", now).caption).toBe("last 7 days · 25–31 Oct (PKT)");
    expect(parseDashboardRange("30d", now).caption).toBe("last 30 days · 2–31 Oct (PKT)");
    expect(parseDashboardRange("all", now).caption).toBe("all time");
  });
  it("spells out both months when a range crosses one", () => {
    expect(formatDaySpan("2026-09-28", "2026-10-04")).toBe("28 Sep–4 Oct");
    expect(formatDaySpan("2026-12-29", "2027-01-04")).toBe("29 Dec–4 Jan");
  });
  it("dates the dashboard in Pakistan time, not UTC", () => {
    // 30 Oct in UTC, already Saturday 31 Oct in Pakistan.
    expect(formatPktLongDay(now)).toBe("Saturday 31 October");
  });
});

describe("formatShare", () => {
  it("rounds to whole percent and never divides by zero", () => {
    expect(formatShare(1, 3)).toBe("33%");
    expect(formatShare(2, 3)).toBe("67%");
    expect(formatShare(0, 0)).toBe("0%");
    expect(formatShare(5, 5)).toBe("100%");
  });
});
