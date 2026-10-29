import { describe, expect, it } from "vitest";
import { canTransition, nextStatuses, restocksOnTransition } from "./status";

describe("order status transitions", () => {
  it("only moves forward or cancels an open order", () => {
    expect(nextStatuses("pending")).toEqual(["confirmed", "cancelled"]);
    expect(canTransition("confirmed", "shipped")).toBe(true);
    expect(canTransition("pending", "delivered")).toBe(false);
    expect(canTransition("delivered", "cancelled")).toBe(false);
    expect(nextStatuses("cancelled")).toEqual([]);
  });
  it("restocks only when an open order is cancelled", () => {
    expect(restocksOnTransition("confirmed", "cancelled")).toBe(true);
    expect(restocksOnTransition("cancelled", "cancelled")).toBe(false);
    expect(restocksOnTransition("confirmed", "shipped")).toBe(false);
  });
});
