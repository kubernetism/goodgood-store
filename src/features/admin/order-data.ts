import "server-only";
import { and, asc, count, eq, gte, isNull, lte, sql, type SQL } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db/client";
import { newsletterSubscribers, orderItems, orders, products } from "@/db/schema";
import { orderStatuses, type OrderStatus } from "@/features/orders/status";
import type { ProductSort } from "./dashboard-stats";
import { LOW_STOCK_THRESHOLD } from "./status-display";

/*
 * Read-only admin queries shared by the shell (nav badge) and the dashboard.
 * Callers have already run requireAdmin().
 */

/** All pending orders, any date; deduplicated per request (nav badge and dashboard share it). */
export const countPendingOrders = cache(async (): Promise<number> => {
  const [row] = await db.select({ value: count() }).from(orders).where(eq(orders.status, "pending"));
  return row?.value ?? 0;
});

/** Orders waiting to be packed (confirmed) or handed to a courier (packed), any date. */
export async function countFulfilmentQueue(): Promise<{ toPack: number; toDispatch: number }> {
  const [row] = await db.select({
    toPack: sql<number>`(count(*) filter (where ${orders.status} = 'confirmed'))::integer`,
    toDispatch: sql<number>`(count(*) filter (where ${orders.status} = 'packed'))::integer`,
  }).from(orders).where(sql`${orders.status} in ('confirmed', 'packed')`);
  return { toPack: Number(row?.toPack ?? 0), toDispatch: Number(row?.toDispatch ?? 0) };
}

const placedSince = (start: Date | null): SQL | undefined => (start ? gte(orders.createdAt, start) : undefined);

/** Order counts per status for orders placed since `start` (null = all time). One GROUP BY. */
export async function orderCountsByStatus(start: Date | null): Promise<Record<OrderStatus, number>> {
  const rows = await db.select({ status: orders.status, value: count() }).from(orders).where(placedSince(start)).groupBy(orders.status);
  const counts = Object.fromEntries(orderStatuses.map((status) => [status, 0])) as Record<OrderStatus, number>;
  for (const row of rows) counts[row.status] = Number(row.value);
  return counts;
}

/**
 * Money in paisa, aggregated in one pass with FILTER. "Sales" are all orders
 * except cancelled ones (cash still to be collected included); "delivered"
 * is cash the customer has paid on delivery. Sums are bigint in SQL.
 */
export async function salesTotals(start: Date | null, todayStart: Date): Promise<{ sales: number; delivered: number; today: number }> {
  const inRange = start ? sql`${orders.createdAt} >= ${start}` : sql`true`;
  const [row] = await db.select({
    sales: sql<string>`coalesce(sum(${orders.total}) filter (where ${inRange} and ${orders.status} <> 'cancelled'), 0)::bigint`,
    delivered: sql<string>`coalesce(sum(${orders.total}) filter (where ${inRange} and ${orders.status} = 'delivered'), 0)::bigint`,
    today: sql<string>`coalesce(sum(${orders.total}) filter (where ${orders.createdAt} >= ${todayStart} and ${orders.status} <> 'cancelled'), 0)::bigint`,
  }).from(orders);
  return { sales: Number(row?.sales ?? 0), delivered: Number(row?.delivered ?? 0), today: Number(row?.today ?? 0) };
}

export type ProductSalesRow = { key: string; productId: string | null; name: string; unit: string; units: number; revenue: number; orders: number };
export type ProductSalesPage = { rows: ProductSalesRow[]; productCount: number; maxUnits: number; maxRevenue: number };

/**
 * Units and revenue per product from order lines, excluding cancelled orders.
 * Lines whose product was deleted group by their slug. The name and unit are
 * the most recent snapshot. Window functions give the totals for paging and
 * bar scaling in the same query.
 */
export async function productSales(start: Date | null, sort: ProductSort, limit: number, offset: number): Promise<ProductSalesPage> {
  const inRange = start ? sql`and o.created_at >= ${start}` : sql``;
  const orderBy = sort === "revenue" ? sql`revenue desc, units desc, name asc` : sql`units desc, revenue desc, name asc`;
  const result = await db.execute(sql`
    WITH grouped AS (
      SELECT coalesce(oi.product_id::text, 'slug:' || oi.product_slug) AS key,
        (array_agg(oi.product_id ORDER BY o.created_at DESC))[1] AS product_id,
        (array_agg(oi.product_name ORDER BY o.created_at DESC))[1] AS name,
        (array_agg(oi.unit ORDER BY o.created_at DESC))[1] AS unit,
        sum(oi.quantity)::bigint AS units,
        sum(oi.line_total)::bigint AS revenue,
        count(DISTINCT oi.order_id)::integer AS orders
      FROM ${orderItems} oi JOIN ${orders} o ON o.id = oi.order_id
      WHERE o.status <> 'cancelled' ${inRange}
      GROUP BY 1
    )
    SELECT *, count(*) OVER () AS product_count, max(units) OVER () AS max_units, max(revenue) OVER () AS max_revenue
    FROM grouped ORDER BY ${orderBy} LIMIT ${limit} OFFSET ${offset}
  `);
  const rows = result.rows as Array<Record<string, unknown>>;
  const first = rows[0];
  return {
    rows: rows.map((row) => ({
      key: String(row.key),
      productId: typeof row.product_id === "string" ? row.product_id : null,
      name: String(row.name ?? ""),
      unit: String(row.unit ?? ""),
      units: Number(row.units ?? 0),
      revenue: Number(row.revenue ?? 0),
      orders: Number(row.orders ?? 0),
    })),
    productCount: Number(first?.product_count ?? 0),
    maxUnits: Number(first?.max_units ?? 0),
    maxRevenue: Number(first?.max_revenue ?? 0),
  };
}

/** Active newsletter subscribers. */
export async function countSubscribers(): Promise<number> {
  const [row] = await db.select({ value: count() }).from(newsletterSubscribers).where(isNull(newsletterSubscribers.unsubscribedAt));
  return row?.value ?? 0;
}

/** The oldest pending orders: the ones most at risk of being forgotten. */
export function oldestPendingOrders(limit = 5) {
  return db
    .select({ id: orders.id, number: orders.number, firstName: orders.firstName, lastName: orders.lastName, city: orders.city, total: orders.total, createdAt: orders.createdAt })
    .from(orders)
    .where(eq(orders.status, "pending"))
    .orderBy(asc(orders.createdAt), asc(orders.number))
    .limit(limit);
}

/** Active products at or below the low-stock threshold, lowest first. */
export function lowestStockProducts(limit = 5) {
  return db
    .select({ id: products.id, name: products.name, unit: products.unit, stock: products.stock })
    .from(products)
    .where(and(eq(products.status, "active"), lte(products.stock, LOW_STOCK_THRESHOLD)))
    .orderBy(asc(products.stock), asc(products.name))
    .limit(limit);
}
