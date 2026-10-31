import { describe, expect, it } from "vitest";
import { parseOrderDateFilter } from "@/features/orders/date-filter";
import { dateFilterLabel, orderListQuery, orderTabQuery } from "./order-list";

const now = new Date("2026-10-31T12:00:00Z");

describe("orderListQuery", () => {
  it("omits the date when it is the status's default", () => {
    expect(orderListQuery("pending", "", parseOrderDateFilter({}, now, "all")).toString()).toBe("status=pending");
    expect(orderListQuery("delivered", "", parseOrderDateFilter({}, now, "today")).toString()).toBe("status=delivered");
  });
  it("keeps a non-default date and range bounds", () => {
    expect(orderListQuery("pending", "ayesha", parseOrderDateFilter({ date: "today" }, now, "all")).toString()).toBe("status=pending&q=ayesha&date=today");
    expect(orderListQuery("pending", "", parseOrderDateFilter({ date: "range", from: "2026-10-01", to: "2026-10-15" }, now, "all")).toString()).toBe("status=pending&date=range&from=2026-10-01&to=2026-10-15");
  });
});

describe("orderTabQuery", () => {
  it("lets each tab use its own default when no date was chosen", () => {
    const filter = parseOrderDateFilter({}, now, "all");
    expect(orderTabQuery("delivered", "", filter, false).toString()).toBe("status=delivered");
    expect(orderTabQuery("confirmed", "07", filter, false).toString()).toBe("status=confirmed&q=07");
  });
  it("carries an explicitly chosen date to every tab", () => {
    const allDates = parseOrderDateFilter({ date: "all" }, now, "all");
    expect(orderTabQuery("delivered", "", allDates, true).toString()).toBe("status=delivered&date=all");
    const today = parseOrderDateFilter({ date: "today" }, now, "all");
    expect(orderTabQuery("confirmed", "", today, true).toString()).toBe("status=confirmed&date=today");
    expect(orderTabQuery("cancelled", "", today, true).toString()).toBe("status=cancelled");
  });
});

describe("dateFilterLabel", () => {
  it("describes the active date filter", () => {
    expect(dateFilterLabel({ mode: "today", from: "", to: "" })).toBe("Today");
    expect(dateFilterLabel({ mode: "all", from: "", to: "" })).toBe("All dates");
    expect(dateFilterLabel({ mode: "range", from: "2026-10-01", to: "2026-10-15" })).toBe("1 Oct – 15 Oct");
    expect(dateFilterLabel({ mode: "range", from: "2026-10-01", to: "2026-10-01" })).toBe("1 Oct");
  });
});
