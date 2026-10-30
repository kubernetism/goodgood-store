import Link from "next/link";
import { and, count, desc, eq, gte, ilike, lt, or, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { orders } from "@/db/schema";
import { AdminHeading, Pager, pageNumber } from "@/features/admin/ui";
import { CopyShippingButton } from "@/features/admin/copy-shipping-button";
import { OrderFilters } from "@/features/admin/order-filters";
import { formatOrderNumber, isOrderStatus, orderStatusLabels, parseOrderNumber } from "@/features/orders/status";
import { parseOrderDateFilter } from "@/features/orders/date-filter";
import { shippingAddress, shippingCopyText } from "@/features/orders/shipping-details";
import { formatPrice } from "@/lib/format";
import { dateToPktLocal, formatPktDateTime } from "@/lib/pk-time";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;

const tabs = ["pending", "confirmed", "shipped", "cancelled", "delivered"] as const;

export default async function OrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const params = await searchParams;
  const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
  const q = (first(params.q) ?? "").trim().slice(0, 100);
  const requestedStatus = first(params.status);
  const status = requestedStatus && isOrderStatus(requestedStatus) ? requestedStatus : "pending";
  const page = pageNumber(first(params.page));
  const now = new Date();
  const dateFilter = parseOrderDateFilter({ date: first(params.date), from: first(params.from), to: first(params.to) }, now);
  const number = parseOrderNumber(q);
  const sharedWhere = and(dateFilter.error ? sql`false` : undefined,
    dateFilter.start ? gte(orders.createdAt, dateFilter.start) : undefined,
    dateFilter.end ? lt(orders.createdAt, dateFilter.end) : undefined,
    q ? or(
    ilike(sql`${orders.firstName} || ' ' || ${orders.lastName}`, `%${q}%`),
    ilike(orders.phone, `%${q}%`),
    ilike(orders.email, `%${q}%`),
    number === null ? undefined : eq(orders.number, number),
  ) : undefined);
  const where = and(eq(orders.status, status), sharedWhere);
  const [rows, counts] = await Promise.all([
    db.select().from(orders).where(where).orderBy(desc(orders.createdAt), desc(orders.number)).limit(21).offset((page - 1) * 20),
    db.select({ status: orders.status, total: count() }).from(orders).where(sharedWhere).groupBy(orders.status),
  ]);
  const totals = new Map(counts.map((entry) => [entry.status, entry.total]));
  const query = new URLSearchParams({ status });
  if (q) query.set("q", q);
  if (dateFilter.mode !== "today") query.set("date", dateFilter.mode);
  if (dateFilter.mode === "range") { query.set("from", dateFilter.from); query.set("to", dateFilter.to); }
  const returnQuery = new URLSearchParams(query);
  if (page > 1) returnQuery.set("page", String(page));

  return <>
    <AdminHeading title="Orders" description="Review orders, print shipping details and update their status." />
    <nav className="admin-order-tabs" aria-label="Orders by status">
      {tabs.map((tab) => {
        const tabQuery = new URLSearchParams(query);
        tabQuery.set("status", tab);
        return <Link key={tab} href={`/admin/orders?${tabQuery}`} aria-current={status === tab ? "page" : undefined}>
          {orderStatusLabels[tab]} <span className="admin-order-tab-count">{totals.get(tab) ?? 0}</span>
        </Link>;
      })}
    </nav>
    <div className="admin-panel">
      <OrderFilters key={`${dateFilter.mode}:${dateFilter.from}:${dateFilter.to}`} status={status} q={q} mode={dateFilter.mode} from={dateFilter.from} to={dateFilter.to} today={dateToPktLocal(now).slice(0, 10)} error={dateFilter.error ?? undefined} clearHref={`/admin/orders?status=${status}`} />
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Shipping address</th><th>Placed</th><th>Items</th><th>Total</th><th>Actions</th></tr></thead><tbody>
        {rows.slice(0, 20).map((order) => <tr key={order.id}>
          <td><Link href={`/admin/orders/${order.id}?returnTo=${encodeURIComponent(returnQuery.toString())}`}>{formatOrderNumber(order.number)}</Link></td>
          <td>{order.firstName} {order.lastName}<br /><span className="admin-muted">{order.phone}</span></td>
          <td className="admin-shipping-address">{shippingAddress(order)}</td>
          <td>{formatPktDateTime(order.createdAt)}</td><td>{order.itemCount}</td><td>{formatPrice(order.total)}</td>
          <td><div className="admin-order-row-actions"><Link href={`/admin/orders/${order.id}?returnTo=${encodeURIComponent(returnQuery.toString())}`} aria-label={`View details for ${formatOrderNumber(order.number)}`}>View details</Link><CopyShippingButton orderNumber={formatOrderNumber(order.number)} text={shippingCopyText(order)} /></div></td>
        </tr>)}
      </tbody></table></div>
      {rows.length === 0 && !dateFilter.error && <p className="admin-muted">No {orderStatusLabels[status].toLowerCase()} orders found for the selected filters.</p>}
      <Pager page={page} hasNext={rows.length > 20} base={`/admin/orders?${query}`} />
    </div>
  </>;
}
