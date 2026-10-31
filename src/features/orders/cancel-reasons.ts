/*
 * Why an order was cancelled (pure, unit tested). The code is stored on the
 * order and on its cancel event; the admin label and the customer-facing
 * wording are separate so internal codes ("fake order") never reach customers.
 */

export const cancelReasons = [
  { value: "customer_request", label: "Customer asked to cancel", customer: "Cancelled at your request." },
  { value: "unreachable", label: "Customer unreachable / no answer", customer: "We could not reach you to confirm the order." },
  { value: "fake_order", label: "Fake or test order", customer: "The order could not be verified." },
  { value: "out_of_stock", label: "Out of stock", customer: "An item in the order is out of stock." },
  { value: "address_issue", label: "Address problem", customer: "There was a problem with the delivery address." },
  { value: "returned", label: "Returned by courier", customer: "The parcel was returned by the courier." },
  { value: "other", label: "Other (explain below)", customer: "The order was cancelled by the store. Please contact us for details." },
] as const;

export type CancelReason = (typeof cancelReasons)[number]["value"];

export const CANCEL_NOTE_MAX = 300;

export function isCancelReason(value: string): value is CancelReason {
  return cancelReasons.some((reason) => reason.value === value);
}

export function cancelReasonLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  return cancelReasons.find((reason) => reason.value === value)?.label.replace(" (explain below)", "") ?? null;
}

export function cancelReasonForCustomer(value: string | null | undefined): string {
  return cancelReasons.find((reason) => reason.value === value)?.customer ?? "The order was cancelled. Please contact us for details.";
}

export type CancellationInput = { reason: string; note: string };
export type Cancellation = { reason: CancelReason; note: string | null };

/** A reason is required; "other" also requires a note. Notes are trimmed, single-spaced and capped. */
export function validateCancellation(input: CancellationInput): { ok: true; data: Cancellation } | { ok: false; error: string } {
  const reason = input.reason.trim();
  if (!isCancelReason(reason)) return { ok: false, error: "Choose why this order is being cancelled." };
  const note = input.note.replace(/\s+/g, " ").trim();
  if (note.length > CANCEL_NOTE_MAX) return { ok: false, error: `Keep the note under ${CANCEL_NOTE_MAX} characters.` };
  if (reason === "other" && !note) return { ok: false, error: "Describe the reason when choosing Other." };
  return { ok: true, data: { reason, note: note || null } };
}

/** Common Pakistani couriers, offered as suggestions (free text is allowed). */
export const courierSuggestions = ["TCS", "Leopards Courier", "M&P", "Trax", "PostEx", "Call Courier", "BlueEx", "Pakistan Post", "Own rider"] as const;

export type CourierDetails = { courierName: string | null; trackingNumber: string | null };

/** Optional courier name and tracking number (both trimmed, capped, printable). */
export function validateCourier(input: { courierName: string; trackingNumber: string }): { ok: true; data: CourierDetails } | { ok: false; error: string } {
  const courierName = input.courierName.replace(/\s+/g, " ").trim();
  const trackingNumber = input.trackingNumber.replace(/\s+/g, "").trim();
  if (courierName.length > 60) return { ok: false, error: "Keep the courier name under 60 characters." };
  if (trackingNumber.length > 40 || (trackingNumber && !/^[A-Za-z0-9\-/]+$/.test(trackingNumber))) {
    return { ok: false, error: "Enter the tracking number using letters, numbers, - or / only." };
  }
  return { ok: true, data: { courierName: courierName || null, trackingNumber: trackingNumber || null } };
}
