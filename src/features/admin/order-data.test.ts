import { PgDialect } from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ select: vi.fn(), execute: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/db/client", () => ({ db: { select: mocks.select, execute: mocks.execute } }));
import { orderCountsByStatus, productSales, salesTotals } from "./order-data";

describe("dashboard aggregation queries", () => {
  it("fills every status with zero and keeps the counts SQL grouped", async () => {
    const groupBy = vi.fn(async () => [{ status: "delivered", value: 3 }, { status: "cancelled", value: 1 }]);
    mocks.select.mockReturnValueOnce({ from: () => ({ where: () => ({ groupBy }) }) });
    const counts = await orderCountsByStatus(new Date("2026-10-01T00:00:00Z"));
    expect(groupBy).toHaveBeenCalledOnce();
    expect(counts).toEqual({ pending: 0, confirmed: 0, packed: 0, dispatched: 0, shipped: 0, delivered: 3, cancelled: 1 });
  });

  it("turns bigint sums (strings from the driver) into numbers", async () => {
    mocks.select.mockReturnValueOnce({ from: async () => [{ sales: "350000000", delivered: "120000", today: "0" }] });
    expect(await salesTotals(null, new Date())).toEqual({ sales: 350_000_000, delivered: 120_000, today: 0 });
  });

  it("maps grouped product rows and the window totals, excluding cancelled orders in SQL", async () => {
    mocks.execute.mockResolvedValueOnce({ rows: [
      { key: "p1", product_id: "p1", name: "Sidr Honey", unit: "500 g", units: "12", revenue: "1200000", orders: 9, product_count: "2", max_units: "12", max_revenue: "1200000" },
      { key: "slug:old", product_id: null, name: "Old Jar", unit: "1 kg", units: "1", revenue: "90000", orders: 1, product_count: "2", max_units: "12", max_revenue: "1200000" },
    ] });
    const page = await productSales(null, "units", 11, 0);
    const query = new PgDialect().sqlToQuery(mocks.execute.mock.calls[0]?.[0] as SQL).sql;
    expect(query).toContain("<> 'cancelled'");
    expect(query).toContain("GROUP BY 1");
    expect(query).toContain("LIMIT $1 OFFSET $2");
    expect(page.productCount).toBe(2);
    expect(page.maxUnits).toBe(12);
    expect(page.rows[0]).toEqual({ key: "p1", productId: "p1", name: "Sidr Honey", unit: "500 g", units: 12, revenue: 1_200_000, orders: 9 });
    expect(page.rows[1]?.productId).toBeNull();
  });

  it("returns an empty page when nothing has sold", async () => {
    mocks.execute.mockResolvedValueOnce({ rows: [] });
    expect(await productSales(null, "revenue", 11, 0)).toEqual({ rows: [], productCount: 0, maxUnits: 0, maxRevenue: 0 });
  });
});
