"use server";

import { randomUUID } from "node:crypto";
import { getCartCatalog } from "@/features/products/catalog";
import { parseCartLines, priceCart } from "@/features/cart/pricing";
import { readFields, type FieldErrors } from "@/lib/forms";
import { checkoutFields, validateBilling, type CheckoutField } from "./validation";

export type CheckoutState =
  | { status: "idle" }
  | { status: "success"; orderNumber: string; total: number; email: string; itemCount: number }
  | {
      status: "error";
      message: string;
      fieldErrors: FieldErrors<CheckoutField>;
      values: Partial<Record<CheckoutField, string>>;
    };

const MAX_CART_PAYLOAD = 10_000;

function parseCartField(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.length > MAX_CART_PAYLOAD) return [];
  try {
    return parseCartLines(JSON.parse(value));
  } catch {
    return [];
  }
}

/**
 * Validates billing details and re-prices the cart from the catalogue: client
 * prices are never trusted. No payment provider or order store exists yet, so
 * a valid order is confirmed without charging or persisting anything.
 */
export async function placeOrder(_previous: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const input = readFields(formData, checkoutFields);
  const billing = validateBilling(input);

  const catalog = new Map(getCartCatalog().map((product) => [product.slug, product]));
  const totals = priceCart(parseCartField(formData.get("cart")), catalog);

  const fieldErrors: FieldErrors<CheckoutField> = billing.ok ? {} : { ...billing.fieldErrors };
  if (totals.lines.length === 0) fieldErrors.cart = "Your cart is empty. Add some products before placing an order.";

  if (!billing.ok || totals.lines.length === 0) {
    return {
      status: "error",
      message: "Please fix the highlighted fields and try again.",
      fieldErrors,
      values: input,
    };
  }

  return {
    status: "success",
    orderNumber: randomUUID().slice(0, 8).toUpperCase(),
    total: totals.total,
    email: billing.data.email,
    itemCount: totals.itemCount,
  };
}
