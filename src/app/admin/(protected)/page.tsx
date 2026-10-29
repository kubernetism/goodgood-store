import Link from "next/link";
import { and, count, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { orders, products } from "@/db/schema";
import { AdminHeading } from "@/features/admin/ui";
import { formatPrice } from "@/lib/format";
import { startOfPktDay } from "@/lib/pk-time";
import { requireAdmin } from "@/server/auth/session";
import { connection } from "next/server";

export const instant = false;

export default async function Dashboard() {
  await connection();
  await requireAdmin();
  const [pending, revenue, lowStock] = await Promise.all([
    db.select({ value: count() }).from(orders).where(eq(orders.status, "pending")),
    db.select({ value: sql<number>`coalesce(sum(${orders.total}), 0)::integer` }).from(orders).where(and(gte(orders.createdAt, startOfPktDay(new Date())), sql`${orders.status} != 'cancelled'`)),
    db.select({ value: count() }).from(products).where(and(eq(products.status, "active"), lte(products.stock, 5))),
  ]);
  return <><AdminHeading title="Overview" description="Your store at a glance." /><div className="admin-grid">
    <Link href="/admin/orders?status=pending" className="admin-panel admin-stat"><span className="admin-muted">Pending orders</span><strong>{pending[0]?.value ?? 0}</strong></Link>
    <div className="admin-panel admin-stat"><span className="admin-muted">Today’s order value</span><strong>{formatPrice(revenue[0]?.value ?? 0)}</strong></div>
    <Link href="/admin/products?stock=low" className="admin-panel admin-stat"><span className="admin-muted">Low stock (5 or fewer)</span><strong>{lowStock[0]?.value ?? 0}</strong></Link>
  </div><section className="admin-panel"><h2>Manage your store</h2><p className="admin-muted">Review new orders, keep stock up to date, and refresh the images and banners shown to customers. Confirm actual stock quantities before accepting orders.</p></section></>;
}
