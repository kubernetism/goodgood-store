import { describe, expect, it } from "vitest";
import { canTransition, nextStatuses, openOrderStatuses, orderLifecycle, orderStatuses, restocksOnTransition } from "./status";

describe("order status transitions", () => {
  it("walks the six stages forward one step at a time", () => {
    expect(orderLifecycle).toEqual(["pending", "confirmed", "packed", "dispatched", "shipped", "delivered"]);
    for (let index = 0; index < orderLifecycle.length - 1; index++) {
      expect(canTransition(orderLifecycle[index]!, orderLifecycle[index + 1]!)).toBe(true);
    }
  });
  it("never skips a stage or moves backwards", () => {
    expect(canTransition("confirmed", "dispatched")).toBe(false);
    expect(canTransition("packed", "shipped")).toBe(false);
    expect(canTransition("pending", "delivered")).toBe(false);
    expect(canTransition("dispatched", "packed")).toBe(false);
  });
  it("lets every open order be cancelled and keeps finished orders final", () => {
    for (const status of openOrderStatuses) expect(canTransition(status, "cancelled")).toBe(true);
    expect(canTransition("delivered", "cancelled")).toBe(false);
    expect(nextStatuses("delivered")).toEqual([]);
    expect(nextStatuses("cancelled")).toEqual([]);
  });
  it("restocks whenever an order not yet delivered is cancelled", () => {
    for (const status of openOrderStatuses) expect(restocksOnTransition(status, "cancelled")).toBe(true);
    expect(restocksOnTransition("cancelled", "cancelled")).toBe(false);
    expect(restocksOnTransition("delivered", "cancelled")).toBe(false);
    expect(restocksOnTransition("packed", "dispatched")).toBe(false);
  });
  it("keeps the database enum and the lifecycle in the same order", () => {
    expect(orderStatuses).toEqual([...orderLifecycle, "cancelled"]);
  });
});
