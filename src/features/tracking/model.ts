import { normalizePakistaniMobile } from "@/features/checkout/validation";
import type { FieldErrors } from "@/lib/forms";
import { formatOrderNumber, orderLifecycle, parseOrderNumber, type LifecycleStatus, type OrderStatus } from "@/features/orders/status";

/*
 * Public order tracking (pure, unit tested): input validation, the customer's
 * wording for each stage, and the stepper derived from the status history.
 */

export const trackingFields = ["order", "phone"] as const;
export type TrackingField = (typeof trackingFields)[number];

/** One message for a wrong number, a wrong phone, or both: no enumeration. */
export const TRACKING_NOT_FOUND = "We couldn't find an order with that order number and mobile number. Check both against your confirmation and try again.";

export function validateTrackingInput(input: Record<TrackingField, string>):
  | { ok: true; data: { number: number; phone: string } }
  | { ok: false; fieldErrors: FieldErrors<TrackingField> } {
  const fieldErrors: FieldErrors<TrackingField> = {};
  const number = input.order.length <= 20 ? parseOrderNumber(input.order) : null;
  const phone = input.phone.length <= 25 ? normalizePakistaniMobile(input.phone) : null;
  if (!input.order) fieldErrors.order = "Enter your order number, e.g. AS-1001.";
  else if (number === null) fieldErrors.order = "Enter the order number as shown on your confirmation, e.g. AS-1001.";
  if (!input.phone) fieldErrors.phone = "Enter the mobile number you used at checkout.";
  else if (!phone) fieldErrors.phone = "Enter a Pakistani mobile number, e.g. 0300 1234567.";
  if (number === null || !phone) return { ok: false, fieldErrors };
  return { ok: true, data: { number, phone } };
}

/** A safe value for the pre-filled order field (?order=AS-1001), or "". */
export function prefillOrderNumber(value: string | undefined): string {
  const number = value && value.length <= 20 ? parseOrderNumber(value) : null;
  return number === null ? "" : formatOrderNumber(number);
}

export const customerStageLabels: Record<LifecycleStatus, string> = {
  pending: "Order placed",
  confirmed: "Confirmed",
  packed: "Packed",
  dispatched: "With the courier",
  shipped: "On the way",
  delivered: "Delivered",
};

export const customerStageHints: Record<OrderStatus, string> = {
  pending: "We have your order and will call you to confirm it.",
  confirmed: "Your order is confirmed and we are preparing it.",
  packed: "Your honey is packed and waiting for the courier.",
  dispatched: "Your parcel has been handed to the courier.",
  shipped: "Your parcel is on its way to you.",
  delivered: "Your order has been delivered. Enjoy your honey!",
  cancelled: "This order was cancelled.",
};

export type StepState = "done" | "current" | "todo";
export type TrackingStep = { status: LifecycleStatus; label: string; state: StepState; at: string | null };
export type TrackingEvent = { fromStatus: OrderStatus | null; toStatus: OrderStatus; at: string };

/**
 * Stepper for the six stages. A cancelled order shows the stages it reached
 * before cancellation as done and the rest as not reached. Orders placed
 * before a stage existed may have no time for it; those show no time.
 */
export function trackingSteps(status: OrderStatus, placedAt: string, events: ReadonlyArray<TrackingEvent>): TrackingStep[] {
  let reached: number;
  if (status === "cancelled") {
    const cancel = events.find((event) => event.toStatus === "cancelled");
    const from = cancel?.fromStatus ?? "pending";
    reached = from === "cancelled" ? 0 : orderLifecycle.indexOf(from);
  } else {
    reached = orderLifecycle.indexOf(status);
  }
  return orderLifecycle.map((step, index) => {
    // A finished order (delivered, or cancelled) has no "current" stage left to wait for.
    const finished = status === "cancelled" || status === "delivered";
    const state: StepState = index < reached ? "done" : index === reached ? (finished ? "done" : "current") : "todo";
    const at = state === "todo" ? null : step === "pending" ? placedAt : (events.find((event) => event.toStatus === step)?.at ?? null);
    return { status: step, label: customerStageLabels[step], state, at };
  });
}
