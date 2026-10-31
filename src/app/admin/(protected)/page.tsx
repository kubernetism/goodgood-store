import Link from "next/link";
import type { Metadata } from "next";
import { and, count, eq, gte, lte, sql } from "drizzle-orm";
import { connection } from "next/server";
import { ImagePlus, Inbox, PackageCheck, Plus, Store } from "lucide-react";
import { db } from "@/db/client";
import { orders, products } from "@/db/schema";
import { countUnreadMessages } from "@/features/admin/message-data";
import { countConfirmedOrders, countPendingOrders, lowestStockProducts, oldestPendingOrders } from "@/features/admin/order-data";
import { LOW_STOCK_THRESHOLD } from "@/features/admin/status-display";
import { AdminHeading, EmptyState, StatCard } from "@/features/admin/ui";
import { formatOrderNumber } from "@/features/orders/status";
import { formatPrice } from "@/lib/format";
import { formatPktDateTime, startOfPktDay } from "@/lib/pk-time";
import { formatRelativeAge } from "@/lib/relative-time";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;
export const metadata: Metadata = { title: "Overview" };

const PENDING_HREF = "/admin/orders?status=pending&date=all";
const LOW_STOCK_HREF = "/admin/products?stock=low&status=active";

export default async function Dashboard() {
  await connection();
  await requireAdmin();
  const now = new Date();
  const [pending, confirmed, revenue, lowStockCount, unreadMessages, waiting, runningLow] = await Promise.all([
    countPendingOrders(),
    countConfirmedOrders(),
    db.select({ value: sql<number>`coalesce(sum(${orders.total}), 0)::integer` }).from(orders).where(and(gte(orders.createdAt, startOfPktDay(now)), sql`${orders.status} != 'cancelled'`)),
    db.select({ value: count() }).from(products).where(and(eq(products.status, "active"), lte(products.stock, LOW_STOCK_THRESHOLD))),
    countUnreadMessages(),
    oldestPendingOrders(5),
    lowestStockProducts(5),
  ]);
  const lowStock = lowStockCount[0]?.value ?? 0;
  const oldest = waiting[0];

  return <div className="admin-page">
    <AdminHeading eyebrow="Today" title="Today at the hive" description="What needs you right now." />
    <div className="admin-stats">
      <StatCard href={PENDING_HREF} label="Pending orders" value={pending} attention={pending > 0} pulse
        context={pending > 0 && oldest ? `Oldest: ${formatRelativeAge(oldest.createdAt, now).toLowerCase()}` : "All clear"} />
      <StatCard href="/admin/orders?status=confirmed&date=all" label="Ready to ship" value={confirmed} context={confirmed > 0 ? "Confirmed, not yet shipped" : "All clear"} />
      <StatCard href="/admin/messages?status=unread" label="Unread messages" value={unreadMessages} attention={unreadMessages > 0} context={unreadMessages > 0 ? "From the contact form" : "All clear"} />
      <StatCard href={LOW_STOCK_HREF} label="Low stock" value={lowStock} context={lowStock > 0 ? `Active products with ${LOW_STOCK_THRESHOLD} or fewer` : "All clear"} />
    </div>

    <div className="admin-dash-panels">
      <section className="admin-panel" aria-labelledby="waiting-title">
        <div className="admin-panel-head">
          <h2 id="waiting-title">Waiting for you</h2>
          <p className="admin-hint">The oldest pending orders first. Confirm actual stock quantities before accepting orders.</p>
        </div>
        {waiting.length ? <ul className="admin-worklist">{waiting.map((order) => <li key={order.id}>
          <span className="admin-worklist-main">
            <span className="admin-worklist-title"><span className="admin-mono">{formatOrderNumber(order.number)}</span> · {order.firstName} {order.lastName}</span>
            <span className="admin-worklist-meta">{order.city} · <span title={`${formatPktDateTime(order.createdAt)} PKT`}>{formatRelativeAge(order.createdAt, now)}</span></span>
          </span>
          <span className="admin-worklist-value">{formatPrice(order.total)}</span>
          <Link className="admin-button secondary sm" href={`/admin/orders/${order.id}`} aria-label={`Open order ${formatOrderNumber(order.number)}`}>Open</Link>
        </li>)}</ul> : <EmptyState icon={<Inbox />} title="No pending orders" headingLevel={3}>New orders appear here as soon as customers place them.</EmptyState>}
        {pending > 0 && <div className="admin-panel-foot"><Link href={PENDING_HREF}>All pending orders ({pending})</Link></div>}
      </section>

      <section className="admin-panel" aria-labelledby="low-title">
        <div className="admin-panel-head">
          <h2 id="low-title">Running low</h2>
          <p className="admin-hint">Active products with {LOW_STOCK_THRESHOLD} or fewer in stock.</p>
        </div>
        {runningLow.length ? <ul className="admin-worklist">{runningLow.map((product) => <li key={product.id}>
          <span className="admin-worklist-main"><span className="admin-worklist-title">{product.name}</span><span className="admin-worklist-meta">{product.unit}</span></span>
          <span className={product.stock <= 0 ? "admin-worklist-value out" : "admin-worklist-value"}>{product.stock <= 0 ? "Out of stock" : `${product.stock} left`}</span>
          <Link className="admin-button secondary sm" href={`/admin/products/${product.id}`} aria-label={`Edit ${product.name}`}>Edit</Link>
        </li>)}</ul> : <EmptyState icon={<PackageCheck />} title="Stock looks healthy" headingLevel={3}>No active product is running low.</EmptyState>}
        {lowStock > 0 && <div className="admin-panel-foot"><Link href={LOW_STOCK_HREF}>All low-stock products ({lowStock})</Link></div>}
      </section>
    </div>

    <div className="admin-dash-quick">
      <StatCard label="Today’s order value" value={formatPrice(revenue[0]?.value ?? 0)} context="Orders placed today (PKT), excluding cancelled" />
      <div className="admin-actions">
        <Link className="admin-button" href="/admin/products/new"><Plus aria-hidden="true" />Add product</Link>
        <Link className="admin-button secondary" href="/admin/media"><ImagePlus aria-hidden="true" />Upload image</Link>
        <Link className="admin-button quiet" href="/"><Store aria-hidden="true" />View store<span aria-hidden="true"> ↗</span></Link>
      </div>
    </div>
  </div>;
}
