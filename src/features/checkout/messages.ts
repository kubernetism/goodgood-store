import type { StockAdjustment } from "@/features/cart/pricing";
import type { FieldErrors } from "@/lib/forms";
import type { CheckoutField } from "./validation";

/*
 * Checkout copy and ordering rules (pure, unit tested).
 */

/**
 * Delivery promise shown in the trust list and on the confirmation.
 * ASSUMPTION: placeholder estimate until the owner confirms courier times.
 */
export const DELIVERY_ESTIMATE = "2–5 working days";

/**
 * Fields in the order they appear on the page. The error summary lists them
 * in this order and the first one gets focus, so focus always lands on the
 * topmost highlighted field. (`checkoutFields` stays in the server's order.)
 */
export const checkoutFieldDisplayOrder = [
  "firstName",
  "lastName",
  "phone",
  "email",
  "street",
  "apartment",
  "city",
  "province",
  "postalCode",
  "paymentMethod",
  "notes",
] as const satisfies ReadonlyArray<CheckoutField>;

/** Field errors in page order (the cart error has no field and is shown on its own). */
export function orderedFieldErrors(errors: FieldErrors<CheckoutField>): Array<{ field: (typeof checkoutFieldDisplayOrder)[number]; message: string }> {
  return checkoutFieldDisplayOrder.flatMap((field) => {
    const message = errors[field];
    return message ? [{ field, message }] : [];
  });
}

/** "Please check 1 field" / "Please check 3 fields". */
export function errorSummaryTitle(count: number): string {
  return `Please check ${count === 1 ? "1 field" : `${count} fields`}`;
}

/** One line of the "We've updated your order" notice. */
export function adjustmentLine(item: Pick<StockAdjustment, "name" | "available">): string {
  if (item.available <= 0) return `${item.name}: sold out, removed from your order.`;
  return `${item.name}: only ${item.available} left, quantity updated.`;
}

/** "1 item" / "3 items". */
export function itemCountLabel(count: number): string {
  return count === 1 ? "1 item" : `${count} items`;
}
