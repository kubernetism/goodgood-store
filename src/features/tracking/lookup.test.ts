import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ select: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/db/client", () => ({ db: { select: mocks.select } }));
import { findTrackedOrder } from "./lookup";

const row = {
  id: "f84da7af-a29d-4638-85e9-d1705a694d18", number: 1001, status: "cancelled", firstName: "Ayesha", city: "Lahore",
  createdAt: new Date("2026-10-30T05:00:00Z"), cancelReason: "fake_order", courierName: null, trackingNumber: null,
  subtotal: 200000, shipping: 25000, total: 225000,
};

describe("findTrackedOrder", () => {
  beforeEach(() => mocks.select.mockReset());

  it("returns null when number and phone do not match", async () => {
    mocks.select.mockReturnValueOnce({ from: () => ({ where: () => ({ limit: async () => [] }) }) });
    expect(await findTrackedOrder(1001, "+923001234567")).toBeNull();
    expect(mocks.select).toHaveBeenCalledOnce();
  });

  it("selects only the fields a customer may see and words the cancel reason politely", async () => {
    mocks.select
      .mockReturnValueOnce({ from: () => ({ where: () => ({ limit: async () => [row] }) }) })
      .mockReturnValueOnce({ from: () => ({ where: async () => [{ name: "Sidr Honey", unit: "500 g", quantity: 2, lineTotal: 200000 }] }) })
      .mockReturnValueOnce({ from: () => ({ where: () => ({ orderBy: async () => [{ fromStatus: "pending", toStatus: "cancelled", createdAt: new Date("2026-10-30T06:00:00Z") }] }) }) });
    const order = await findTrackedOrder(1001, "+923001234567");
    const columns = Object.keys(mocks.select.mock.calls[0]?.[0] ?? {});
    for (const pii of ["phone", "email", "street", "apartment", "postalCode", "lastName", "notes", "cancelNote"]) expect(columns).not.toContain(pii);
    expect(order?.orderNumber).toBe("AS-1001");
    expect(order?.cancellation).toEqual({ at: "2026-10-30T06:00:00.000Z", reason: "The order could not be verified." });
    expect(order?.courier).toBeNull();
    expect(JSON.stringify(order)).not.toMatch(/fake/i);
  });
});
