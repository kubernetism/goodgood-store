import Link from "next/link";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db/client";
import { orders } from "@/db/schema";
import { AdminHeading, Pager, pageNumber } from "@/features/admin/ui";
import { formatOrderNumber, isOrderStatus, orderStatuses, orderStatusLabels, parseOrderNumber } from "@/features/orders/status";
import { formatPrice } from "@/lib/format";
import { formatPktDateTime } from "@/lib/pk-time";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const q = (params.q ?? "").trim().slice(0, 100);
  const status = params.status ?? "";
  const page = pageNumber(params.page);
  const number = parseOrderNumber(q);
  const where = and(isOrderStatus(status) ? eq(orders.status, status) : undefined, q ? or(ilike(orders.firstName, `%${q}%`), ilike(orders.lastName, `%${q}%`), ilike(orders.phone, `%${q}%`), number === null ? undefined : eq(orders.number, number)) : undefined);
  const rows = await db.select().from(orders).where(where).orderBy(desc(orders.createdAt), desc(orders.number)).limit(21).offset((page - 1) * 20);
  const query = new URLSearchParams(); if (q) query.set("q", q); if (status) query.set("status", status);
  const base = `/admin/orders${query.size ? `?${query}` : ""}`;
  return <><AdminHeading title="Orders" description="Find and manage customer orders." /><div className="admin-panel">
    <form className="admin-search" action="/admin/orders"><input name="q" defaultValue={q} placeholder="Order number, name or phone" aria-label="Search orders" /><select name="status" defaultValue={status} aria-label="Order status"><option value="">All statuses</option>{orderStatuses.map((s) => <option key={s} value={s}>{orderStatusLabels[s]}</option>)}</select><button className="admin-button secondary">Search</button></form>
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Status</th><th>Total</th></tr></thead><tbody>{rows.slice(0, 20).map((o) => <tr key={o.id}><td><Link href={`/admin/orders/${o.id}`}>{formatOrderNumber(o.number)}</Link></td><td>{o.firstName} {o.lastName}<br /><span className="admin-muted">{o.phone}</span></td><td>{formatPktDateTime(o.createdAt)}</td><td>{orderStatusLabels[o.status]}</td><td>{formatPrice(o.total)}</td></tr>)}</tbody></table></div>
    {rows.length === 0 && <p className="admin-muted">No orders found.</p>}<Pager page={page} hasNext={rows.length > 20} base={base} />
  </div></>;
}
