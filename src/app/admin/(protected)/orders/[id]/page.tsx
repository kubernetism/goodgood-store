import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { z } from "zod";
import { db } from "@/db/client";
import { orderEvents, orderItems, orders } from "@/db/schema";
import { changeOrderStatus } from "@/features/admin/actions";
import { AdminHeading, AdminNotice } from "@/features/admin/ui";
import { formatOrderNumber, nextStatuses, orderStatusLabels } from "@/features/orders/status";
import { formatPrice } from "@/lib/format";
import { formatPktDateTime } from "@/lib/pk-time";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;

export default async function OrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireAdmin();
  const { id } = await params; if (!z.uuid().safeParse(id).success) notFound();
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1); if (!order) notFound();
  const [items, history, notice] = await Promise.all([db.select().from(orderItems).where(eq(orderItems.orderId, id)), db.select().from(orderEvents).where(eq(orderEvents.orderId, id)).orderBy(asc(orderEvents.createdAt)), searchParams]);
  const next = nextStatuses(order.status);
  return <><AdminHeading title={formatOrderNumber(order.number)} description={`${orderStatusLabels[order.status]} · ${formatPktDateTime(order.createdAt)}`} /><AdminNotice {...notice} /><div className="admin-columns" style={{ marginTop: 18 }}>
    <section className="admin-panel"><h2>Customer & delivery</h2><p>{order.firstName} {order.lastName}<br />{order.phone}<br />{order.email}<br />{order.street}{order.apartment && `, ${order.apartment}`}<br />{order.city}, {order.province} {order.postalCode}<br />Pakistan</p>{order.notes && <p>Notes: {order.notes}</p>}</section>
    <section className="admin-panel"><h2>Update status</h2><p className="admin-muted">Current: {orderStatusLabels[order.status]}</p>{next.length ? <form action={changeOrderStatus} className="admin-form"><input type="hidden" name="id" value={id} /><label>Next status<select name="status">{next.map((s) => <option key={s} value={s}>{orderStatusLabels[s]}</option>)}</select></label><label className="check"><input type="checkbox" name="confirm" value="yes" /> Confirm if cancelling (items return to stock)</label><button className="admin-button">Update status</button></form> : <p className="admin-muted">This order is complete.</p>}</section>
  </div><section className="admin-panel" style={{ marginTop: 16 }}><h2>Order items</h2><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Product</th><th>Quantity</th><th>Unit price</th><th>Total</th></tr></thead><tbody>{items.map((i) => <tr key={i.id}><td>{i.productName} · {i.unit}</td><td>{i.quantity}</td><td>{formatPrice(i.unitPrice)}</td><td>{formatPrice(i.lineTotal)}</td></tr>)}</tbody></table></div><p>Subtotal: {formatPrice(order.subtotal)} · Delivery: {formatPrice(order.shipping)} · <strong>Total: {formatPrice(order.total)}</strong></p><p className="admin-muted">Payment: Cash on delivery</p></section>
  <section className="admin-panel" style={{ marginTop: 16 }}><h2>History</h2>{history.map((event) => <p key={event.id} className="admin-muted">{formatPktDateTime(event.createdAt)} · {orderStatusLabels[event.toStatus]} · {event.actor}</p>)}</section></>;
}
