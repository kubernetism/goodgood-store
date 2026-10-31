import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { orderEvents, orderItems, orders } from "@/db/schema";
import { cancelReasonForCustomer } from "@/features/orders/cancel-reasons";
import { formatOrderNumber, type OrderStatus } from "@/features/orders/status";
import { customerStageHints, trackingSteps, type TrackingStep } from "./model";

/** What the customer sees: no address, phone, email or surname. */
export type TrackedOrder = {
  orderNumber: string;
  status: OrderStatus;
  hint: string;
  firstName: string;
  city: string;
  placedAt: string;
  steps: TrackingStep[];
  cancellation: { at: string | null; reason: string } | null;
  courier: { name: string | null; trackingNumber: string | null } | null;
  items: { name: string; unit: string; quantity: number; lineTotal: number }[];
  subtotal: number;
  shipping: number;
  total: number;
};

/** The order only when both the number and the checkout phone match. */
export async function findTrackedOrder(number: number, phone: string): Promise<TrackedOrder | null> {
  const [order] = await db
    .select({
      id: orders.id, number: orders.number, status: orders.status, firstName: orders.firstName, city: orders.city,
      createdAt: orders.createdAt, cancelReason: orders.cancelReason, courierName: orders.courierName,
      trackingNumber: orders.trackingNumber, subtotal: orders.subtotal, shipping: orders.shipping, total: orders.total,
    })
    .from(orders)
    .where(and(eq(orders.number, number), eq(orders.phone, phone)))
    .limit(1);
  if (!order) return null;
  const [items, history] = await Promise.all([
    db.select({ name: orderItems.productName, unit: orderItems.unit, quantity: orderItems.quantity, lineTotal: orderItems.lineTotal }).from(orderItems).where(eq(orderItems.orderId, order.id)),
    db.select({ fromStatus: orderEvents.fromStatus, toStatus: orderEvents.toStatus, createdAt: orderEvents.createdAt }).from(orderEvents).where(eq(orderEvents.orderId, order.id)).orderBy(asc(orderEvents.createdAt)),
  ]);
  const events = history.map((event) => ({ fromStatus: event.fromStatus, toStatus: event.toStatus, at: event.createdAt.toISOString() }));
  const placedAt = order.createdAt.toISOString();
  const cancelled = order.status === "cancelled";
  const hasCourier = Boolean(order.courierName || order.trackingNumber) && (order.status === "dispatched" || order.status === "shipped" || order.status === "delivered");
  return {
    orderNumber: formatOrderNumber(order.number),
    status: order.status,
    hint: customerStageHints[order.status],
    firstName: order.firstName,
    city: order.city,
    placedAt,
    steps: trackingSteps(order.status, placedAt, events),
    cancellation: cancelled ? { at: events.find((event) => event.toStatus === "cancelled")?.at ?? null, reason: cancelReasonForCustomer(order.cancelReason) } : null,
    courier: hasCourier ? { name: order.courierName, trackingNumber: order.trackingNumber } : null,
    items,
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
  };
}
