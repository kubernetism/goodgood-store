import "server-only";
import { and, asc, count, eq, lte } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db/client";
import { orders, products } from "@/db/schema";
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

export async function countConfirmedOrders(): Promise<number> {
  const [row] = await db.select({ value: count() }).from(orders).where(eq(orders.status, "confirmed"));
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
