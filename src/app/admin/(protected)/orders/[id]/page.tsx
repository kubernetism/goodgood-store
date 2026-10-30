import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { z } from "zod";
import { db } from "@/db/client";
import { orderEvents, orderItems, orders } from "@/db/schema";
import { changeOrderStatus } from "@/features/admin/actions";
import { PrintOrderButton } from "@/features/admin/print-order-button";
import { AdminHeading, AdminNotice } from "@/features/admin/ui";
import { formatOrderNumber, nextStatuses, orderStatusLabels } from "@/features/orders/status";
import { formatPrice } from "@/lib/format";
import { formatPktDateTime } from "@/lib/pk-time";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;

export default async function OrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string; returnTo?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) notFound();
  const [items, history, notice] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, id)),
    db.select().from(orderEvents).where(eq(orderEvents.orderId, id)).orderBy(asc(orderEvents.createdAt)),
    searchParams,
  ]);
  const next = nextStatuses(order.status);
  const printable = order.status === "confirmed" || order.status === "shipped" || order.status === "delivered";
  // Only use query parameters on the local orders page, never a caller-supplied URL.
  const backQuery = notice.returnTo && notice.returnTo.length <= 600 ? new URLSearchParams(notice.returnTo) : null;
  const backHref = backQuery ? `/admin/orders?${backQuery}` : `/admin/orders?status=${order.status}`;

  return <div className="admin-order-detail">
    <div className="admin-order-screen-only">
      <Link className="admin-order-back" href={backHref}>← Back to orders</Link>
      <AdminHeading title={formatOrderNumber(order.number)} description={`${orderStatusLabels[order.status]} · ${formatPktDateTime(order.createdAt)} PKT`} />
      <AdminNotice {...notice} />
      {printable && <div className="admin-actions" style={{ marginBottom: 18 }}><PrintOrderButton /></div>}
    </div>

    <div className="admin-order-print-heading"><h1>Shipping details · {formatOrderNumber(order.number)}</h1><p>Placed {formatPktDateTime(order.createdAt)} PKT · {orderStatusLabels[order.status]}</p></div>
    <div className="admin-columns" style={{ marginTop: 18 }}>
      <section className="admin-panel">
        <h2>Customer &amp; delivery</h2>
        <dl className="admin-order-fields">
          <div><dt>Customer name</dt><dd>{order.firstName} {order.lastName}</dd></div>
          <div><dt>Phone</dt><dd><a href={`tel:${order.phone}`}>{order.phone}</a></dd></div>
          <div><dt>Email</dt><dd>{order.email ? <a href={`mailto:${order.email}`}>{order.email}</a> : "Not provided"}</dd></div>
          <div><dt>House number and street</dt><dd>{order.street}</dd></div>
          <div><dt>Area or landmark</dt><dd>{order.apartment || "Not provided"}</dd></div>
          <div><dt>City</dt><dd>{order.city}</dd></div>
          <div><dt>Province or territory</dt><dd>{order.province}</dd></div>
          <div><dt>Postal code</dt><dd>{order.postalCode || "Not provided"}</dd></div>
          <div><dt>Country</dt><dd>Pakistan</dd></div>
          <div><dt>Order notes</dt><dd className="admin-order-notes">{order.notes || "None"}</dd></div>
        </dl>
      </section>
      <section className="admin-panel admin-order-screen-only">
        <h2>Update status</h2>
        <p className="admin-muted">Current: {orderStatusLabels[order.status]}</p>
        {order.status === "pending" && <p className="admin-muted">Confirm this order when it is ready. Confirmation is manual.</p>}
        {order.status === "confirmed" && <p className="admin-muted">Print the shipping details, then mark the order shipped when it is dispatched.</p>}
        {order.status === "shipped" && <p className="admin-muted">Mark the order delivered once the customer receives it.</p>}
        {next.length ? <form action={changeOrderStatus} className="admin-form">
          <input type="hidden" name="id" value={id} />
          {backQuery && <input type="hidden" name="returnTo" value={backQuery.toString()} />}
          <label>Next status<select name="status">{next.map((status) => <option key={status} value={status}>{orderStatusLabels[status]}</option>)}</select></label>
          <label className="check"><input type="checkbox" name="confirm" value="yes" /> Confirm if cancelling (items return to stock)</label>
          <div><button className="admin-button">Update status</button></div>
        </form> : <p className="admin-muted">This order is complete.</p>}
      </section>
    </div>
    <section className="admin-panel" style={{ marginTop: 16 }}>
      <h2>Order items</h2>
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Product</th><th>Quantity</th><th>Unit price</th><th>Total</th></tr></thead><tbody>
        {items.map((item) => <tr key={item.id}><td>{item.productName} · {item.unit}</td><td>{item.quantity}</td><td>{formatPrice(item.unitPrice)}</td><td>{formatPrice(item.lineTotal)}</td></tr>)}
      </tbody></table></div>
      <dl className="admin-order-totals">
        <div><dt>Items</dt><dd>{order.itemCount}</dd></div>
        <div><dt>Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
        <div><dt>Delivery</dt><dd>{formatPrice(order.shipping)}</dd></div>
        <div><dt>Total</dt><dd><strong>{formatPrice(order.total)}</strong></dd></div>
        <div><dt>Payment method</dt><dd>{order.paymentMethod === "cod" ? "Cash on delivery" : order.paymentMethod}</dd></div>
      </dl>
    </section>
    <section className="admin-panel admin-order-screen-only" style={{ marginTop: 16 }}><h2>Status history</h2>{history.map((event) => <p key={event.id} className="admin-muted">{formatPktDateTime(event.createdAt)} PKT · {orderStatusLabels[event.toStatus]} · {event.actor}</p>)}</section>
  </div>;
}
