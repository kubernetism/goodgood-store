import type { Metadata } from "next";
import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { MessageCircle, Phone } from "lucide-react";
import { z } from "zod";
import { db } from "@/db/client";
import { orderEvents, orderItems, orders } from "@/db/schema";
import { changeOrderStatus, saveCourierDetails } from "@/features/admin/actions";
import { telHref, waLink } from "@/features/admin/contact-links";
import { CopyShippingButton } from "@/features/admin/copy-shipping-button";
import { PrintOrderButton } from "@/features/admin/print-order-button";
import { firstParam, type RawSearchParams } from "@/features/admin/search-params";
import { canCancel, forwardStatus, hasShippingSlip, hexLevel, statusActionLabel } from "@/features/admin/status-display";
import { SubmitButton } from "@/features/admin/submit-button";
import { AdminTable, TBody, Td, Th, THead, Tr } from "@/features/admin/table";
import { AdminHeading, AdminNotice, DangerZone, Field, HexGlyph, OrderStatusPill } from "@/features/admin/ui";
import { CANCEL_NOTE_MAX, cancelReasonLabel, cancelReasons, courierSuggestions } from "@/features/orders/cancel-reasons";
import { formatOrderNumber, orderLifecycle, orderStatusDescriptions, orderStatusLabels, type OrderStatus } from "@/features/orders/status";
import { shippingCopyText } from "@/features/orders/shipping-details";
import { formatPrice } from "@/lib/format";
import { formatPktDateTime } from "@/lib/pk-time";
import { siteConfig } from "@/lib/site";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;
// A static title: metadata must not read order data outside the page's auth check.
export const metadata: Metadata = { title: "Order details" };

const lifecycle = orderLifecycle;

const stageHelp: Partial<Record<OrderStatus, string>> = {
  pending: "Call or WhatsApp the customer and check stock, then confirm this order. Confirmation is manual.",
  confirmed: "Pack the items and print the shipping details, then mark the order packed.",
  packed: "Hand the parcel to the courier, then mark it dispatched. Add the courier and tracking number so the customer can follow it.",
  dispatched: "Mark the order shipped once the courier shows it in transit.",
  shipped: "Mark the order delivered once the customer receives it and pays.",
};

const COURIER_STATUSES: ReadonlyArray<OrderStatus> = ["dispatched", "shipped", "delivered"];

export default async function OrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<RawSearchParams> }) {
  await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) notFound();
  const [items, history, query] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, id)),
    db.select().from(orderEvents).where(eq(orderEvents.orderId, id)).orderBy(asc(orderEvents.createdAt)),
    searchParams,
  ]);
  const notice = { error: firstParam(query.error), saved: firstParam(query.saved), courier: firstParam(query.courier), returnTo: firstParam(query.returnTo) };
  const orderNumber = formatOrderNumber(order.number);
  const forward = forwardStatus(order.status);
  const cancellable = canCancel(order.status);
  const printable = hasShippingSlip(order.status);
  const withCourier = COURIER_STATUSES.includes(order.status);
  const courierLine = [order.courierName, order.trackingNumber && `Tracking ${order.trackingNumber}`].filter(Boolean).join(" · ");
  const cancelReason = cancelReasonLabel(order.cancelReason);
  // Only use query parameters on the local orders page, never a caller-supplied URL.
  const backQuery = notice.returnTo && notice.returnTo.length <= 600 ? new URLSearchParams(notice.returnTo) : null;
  const backHref = backQuery ? `/admin/orders?${backQuery}` : `/admin/orders?status=${order.status}`;
  const tel = telHref(order.phone);
  const whatsapp = waLink(order.phone);
  const cod = order.paymentMethod === "cod";
  const reachedAt = (status: OrderStatus) => status === "pending" ? order.createdAt : history.find((event) => event.toStatus === status)?.createdAt;
  const currentIndex = lifecycle.indexOf(order.status as (typeof lifecycle)[number]);
  const timeline = history.some((event) => event.fromStatus === null)
    ? history
    : [{ id: "placed", fromStatus: null, toStatus: "pending" as const, actor: "Customer", reason: null, note: null, createdAt: order.createdAt }, ...history];
  const addressLines = [order.street, order.apartment, `${order.city}, ${order.province}${order.postalCode ? ` ${order.postalCode}` : ""}`, "Pakistan"].filter(Boolean);

  return <div className="admin-page admin-order-detail">
    <div className={printable ? "admin-page admin-screen-only" : "admin-page"}>
      <AdminHeading
        back={{ href: backHref, label: "Back to orders" }}
        eyebrow="Order"
        title={orderNumber}
        mono
        meta={<><OrderStatusPill status={order.status} /><span className="admin-muted">Placed {formatPktDateTime(order.createdAt)} PKT</span></>}
      />
      <AdminNotice error={notice.error} saved={notice.saved || notice.courier} message={notice.courier ? "Courier details saved." : `Order ${orderNumber} is now ${orderStatusDescriptions[order.status]}.`} clear="saved,error,courier" />

      {order.status === "cancelled"
        ? <div className="admin-cancelled-banner"><HexGlyph level={0} struck /><div>
          <p>This order was cancelled. Its items were returned to stock.</p>
          {cancelReason && <p className="admin-cancelled-reason">Reason: {cancelReason}{order.cancelNote ? ` — ${order.cancelNote}` : ""}</p>}
        </div></div>
        : <ol className="admin-progress" aria-label="Order progress">
          {lifecycle.map((step, index) => {
            const at = reachedAt(step);
            const state = index < currentIndex ? "done" : index === currentIndex ? "current" : "todo";
            return <li key={step} data-state={state} aria-current={state === "current" ? "step" : undefined}>
              <HexGlyph level={state === "todo" ? 0 : hexLevel(step).level} />
              <span className="admin-progress-label">{orderStatusLabels[step]}</span>
              {state === "current" && <span className="admin-progress-now">Now</span>}
              {at && state !== "todo" && <span className="admin-progress-time">{formatPktDateTime(at)}</span>}
            </li>;
          })}
        </ol>}

      <div className="admin-order-layout">
        <div className="admin-order-aside">
          <section className="admin-panel admin-next-step" aria-labelledby="next-step-title">
            <h2 id="next-step-title">{forward ? "Next step" : order.status === "cancelled" ? "Order closed" : "Order complete"}</h2>
            {stageHelp[order.status] && <p className="admin-hint">{stageHelp[order.status]}</p>}
            {forward ? <form action={changeOrderStatus} className={forward === "dispatched" ? "admin-form" : undefined}>
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="status" value={forward} />
              {backQuery && <input type="hidden" name="returnTo" value={backQuery.toString()} />}
              {forward === "dispatched" && <CourierFields courierName={order.courierName} trackingNumber={order.trackingNumber} />}
              <SubmitButton block pendingLabel="Updating…">{statusActionLabel(forward)}</SubmitButton>
            </form> : <p className="admin-muted">{order.status === "delivered" ? "This order is complete: the customer received it." : "No further changes are possible."}</p>}
            <div className="admin-next-step-secondary">
              {printable && <PrintOrderButton />}
              <CopyShippingButton orderNumber={orderNumber} text={shippingCopyText(order)} size="md" />
            </div>
          </section>
          {withCourier && <details className="admin-panel admin-courier-edit">
            <summary>{courierLine ? "Edit courier details" : "Add courier details"}</summary>
            <form action={saveCourierDetails} className="admin-form">
              <input type="hidden" name="id" value={id} />
              <CourierFields courierName={order.courierName} trackingNumber={order.trackingNumber} />
              <div><SubmitButton variant="secondary" pendingLabel="Saving…">Save courier details</SubmitButton></div>
            </form>
          </details>}
          {cancellable && <DangerZone summary="Cancel this order">
            <p>Cancelling is final. The order cannot be reopened, and its {order.itemCount === 1 ? "item returns" : `${order.itemCount} items return`} to stock. The customer sees a short, polite version of the reason on the tracking page; your note stays private.</p>
            <form action={changeOrderStatus} className="admin-form">
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="status" value="cancelled" />
              {backQuery && <input type="hidden" name="returnTo" value={backQuery.toString()} />}
              <Field label="Reason">
                <select name="reason" required defaultValue="">
                  <option value="" disabled>Choose a reason</option>
                  {cancelReasons.map((reason) => <option key={reason.value} value={reason.value}>{reason.label}</option>)}
                </select>
              </Field>
              <Field label="Note" optional hint={`Required when the reason is Other. Up to ${CANCEL_NOTE_MAX} characters.`}>
                <textarea name="note" rows={2} maxLength={CANCEL_NOTE_MAX} />
              </Field>
              <label className="check"><input type="checkbox" name="confirm" value="yes" required /> Cancel this order and return {order.itemCount === 1 ? "1 item" : `${order.itemCount} items`} to stock</label>
              <div><SubmitButton variant="danger" pendingLabel="Cancelling…">Cancel order</SubmitButton></div>
            </form>
          </DangerZone>}
        </div>

        <div className="admin-order-main">
          <section className="admin-panel" aria-labelledby="customer-title">
            <div className="admin-panel-head"><h2 id="customer-title">Customer and delivery</h2></div>
            <dl className="admin-dl">
              <div><dt>Customer name</dt><dd>{order.firstName} {order.lastName}</dd></div>
              <div><dt>Phone</dt><dd>
                <span className="admin-mono">{order.phone}</span>
                {(tel || whatsapp) && <span className="admin-contact-actions">
                  {tel && <a className="admin-button secondary" href={tel}><Phone aria-hidden="true" />Call</a>}
                  {whatsapp && <a className="admin-button secondary" href={whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden="true" />WhatsApp<span className="sr-only"> (opens WhatsApp)</span></a>}
                </span>}
              </dd></div>
              <div><dt>Email</dt><dd>{order.email ? <a href={`mailto:${order.email}`}>{order.email}</a> : "Not provided"}</dd></div>
              <div><dt>Delivery address</dt><dd className="admin-pre">{addressLines.join("\n")}</dd></div>
              {withCourier && <div><dt>Courier</dt><dd>{courierLine ? <span className="admin-mono">{courierLine}</span> : "Not recorded"}</dd></div>}
              <div><dt>Order notes</dt><dd className="admin-pre">{order.notes || "None"}</dd></div>
            </dl>
          </section>

          <section className="admin-panel" aria-labelledby="items-title">
            <div className="admin-panel-head"><h2 id="items-title">Items</h2></div>
            <AdminTable label="Order items" cards="never" className="admin-items-table">
              <THead><Th>Product</Th><Th num>Qty</Th><Th num>Unit price</Th><Th num>Total</Th></THead>
              <TBody>{items.map((item) => <Tr key={item.id}><Td>{item.productName} · {item.unit}</Td><Td num>{item.quantity}</Td><Td num>{formatPrice(item.unitPrice)}</Td><Td num>{formatPrice(item.lineTotal)}</Td></Tr>)}</TBody>
            </AdminTable>
            <dl className="admin-totals">
              <div><dt>Items</dt><dd>{order.itemCount}</dd></div>
              <div><dt>Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
              <div><dt>Delivery</dt><dd>{formatPrice(order.shipping)}</dd></div>
              <div><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
            </dl>
            <p className="admin-cod">{cod ? <>Cash on delivery: collect <strong>{formatPrice(order.total)}</strong></> : <>Payment method: {order.paymentMethod}</>}</p>
          </section>

          <section className="admin-panel" aria-labelledby="history-title">
            <div className="admin-panel-head"><h2 id="history-title">History</h2></div>
            <ol className="admin-timeline">{timeline.map((event) => {
              const glyph = hexLevel(event.toStatus);
              const reason = cancelReasonLabel(event.reason);
              const detail = [reason, event.note].filter(Boolean).join(" — ");
              return <li key={event.id}><HexGlyph level={glyph.level} struck={glyph.struck} /><span className="admin-timeline-text">
                <span>{event.fromStatus === null ? "Order placed" : `Marked as ${orderStatusDescriptions[event.toStatus]}`}</span>
                {detail && <span className="admin-timeline-detail">{detail}</span>}
                <span>{formatPktDateTime(event.createdAt)} PKT · {event.actor}</span>
              </span></li>;
            })}</ol>
          </section>
        </div>
      </div>
    </div>

    {printable && <article className="admin-print-only admin-slip" aria-hidden="true">
      <div className="admin-slip-head"><span className="admin-slip-number">{orderNumber}</span><span>Placed {formatPktDateTime(order.createdAt)} PKT</span></div>
      <div className="admin-slip-block admin-slip-to">
        <p className="admin-slip-label">To</p>
        <p><strong>{order.firstName} {order.lastName}</strong></p>
        <p>Phone: {order.phone}</p>
        <p className="admin-pre">{addressLines.join("\n")}</p>
        {order.notes && <p>Notes: {order.notes}</p>}
      </div>
      {courierLine && <p className="admin-slip-courier">Courier: {courierLine}</p>}
      <p className="admin-slip-cod">{cod ? `Collect on delivery: ${formatPrice(order.total)}` : `Paid by ${order.paymentMethod}`}</p>
      <table className="admin-slip-block">
        <thead><tr><th>Item</th><th className="num">Qty</th><th className="num">Total</th></tr></thead>
        <tbody>{items.map((item) => <tr key={item.id}><td>{item.productName} · {item.unit}</td><td className="num">{item.quantity}</td><td className="num">{formatPrice(item.lineTotal)}</td></tr>)}</tbody>
      </table>
      <div className="admin-slip-block admin-slip-from">
        <p className="admin-slip-label">From</p>
        <p>{siteConfig.legalName}</p>
        <p>{siteConfig.contact.address}</p>
        <p>Phone: {siteConfig.contact.primary.phoneDisplay}</p>
      </div>
    </article>}
  </div>;
}

/** Optional courier name (with common Pakistani couriers suggested) and tracking number. */
function CourierFields({ courierName, trackingNumber }: { courierName: string | null; trackingNumber: string | null }) {
  return <>
    <Field label="Courier" optional>
      <input name="courierName" list="admin-courier-options" maxLength={60} defaultValue={courierName ?? ""} autoComplete="off" />
    </Field>
    <datalist id="admin-courier-options">{courierSuggestions.map((name) => <option key={name} value={name} />)}</datalist>
    <Field label="Tracking number" optional hint="Shown to the customer on the Track your order page.">
      <input name="trackingNumber" maxLength={40} defaultValue={trackingNumber ?? ""} autoComplete="off" spellCheck={false} className="admin-mono" />
    </Field>
  </>;
}
