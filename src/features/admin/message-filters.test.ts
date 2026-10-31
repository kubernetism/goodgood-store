import { describe, expect, it } from "vitest";
import { messageFilterQuery, parseMessageFilters, retentionCutoff } from "./message-filters";
import { firstParam, pageNumber } from "./search-params";

describe("firstParam", () => {
  it("returns the first of repeated values and passes plain values through", () => {
    expect(firstParam(["unread", "read"])).toBe("unread");
    expect(firstParam("read")).toBe("read");
    expect(firstParam(undefined)).toBeUndefined();
    expect(firstParam([])).toBeUndefined();
  });
});

describe("pageNumber", () => {
  it("clamps to a sane positive integer", () => {
    expect(pageNumber(undefined)).toBe(1);
    expect(pageNumber("3")).toBe(3);
    expect(pageNumber("0")).toBe(1);
    expect(pageNumber("2.5")).toBe(1);
    expect(pageNumber("abc")).toBe(1);
    expect(pageNumber("999999")).toBe(10000);
  });
});

describe("parseMessageFilters", () => {
  it("defaults to every message on page one", () => {
    expect(parseMessageFilters({})).toEqual({ q: "", status: "", age: "", page: 1 });
  });
  it("reads search, status, age and page, trimming and capping the search", () => {
    const filters = parseMessageFilters({ q: `  ${"x".repeat(150)}  `, status: "unread", age: "retention", page: "4" });
    expect(filters).toEqual({ q: "x".repeat(100), status: "unread", age: "retention", page: 4 });
  });
  it("takes the first of repeated parameters", () => {
    expect(parseMessageFilters({ q: ["honey", "jar"], status: ["read", "unread"], page: ["2", "9"] })).toMatchObject({ q: "honey", status: "read", page: 2 });
  });
  it("ignores unknown status and age values", () => {
    expect(parseMessageFilters({ status: "archived", age: "forever" })).toMatchObject({ status: "", age: "" });
  });
  it("builds a pagination query that keeps only active filters", () => {
    expect(String(messageFilterQuery({ q: "bulk order", status: "", age: "retention", page: 3 }))).toBe("q=bulk+order&age=retention");
    expect(String(messageFilterQuery(parseMessageFilters({})))).toBe("");
  });
});

describe("retentionCutoff", () => {
  it("is 24 calendar months before now", () => {
    expect(retentionCutoff(new Date("2026-10-31T07:00:00Z")).toISOString()).toBe("2024-10-31T07:00:00.000Z");
    expect(retentionCutoff(new Date("2026-03-15T00:00:00Z")).toISOString()).toBe("2024-03-15T00:00:00.000Z");
  });
});
