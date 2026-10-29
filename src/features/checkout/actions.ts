"use server";

import { randomUUID } from "node:crypto";
import { and, count, eq, gt, inArray, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { db } from "@/db/client";
import { categories, orderEvents, orderItems, orders, products } from "@/db/schema";
import { parseCartLines, type StockAdjustment } from "@/features/cart/pricing";
import { describeAdjustments, prepareOrder, type PurchasableProduct } from "@/features/orders/prepare";
import { formatOrderNumber } from "@/features/orders/status";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { readFields, type FieldErrors } from "@/lib/forms";
import { getClientIpHash } from "@/server/request";
import { isCheckViolation } from "@/server/db-errors";
import { checkoutFields, validateBilling, type CheckoutField } from "./validation";

export type CheckoutState =
  | { status: "idle" }
  | { status: "success"; orderNumber: string; total: number; phone: string; itemCount: number }
  | {
      status: "error";
      message: string;
      fieldErrors: FieldErrors<CheckoutField>;
      values: Partial<Record<CheckoutField, string>>;
      /** Lines the client should reduce or remove (stock changed since the cart was filled). */
      stockAdjustments?: StockAdjustment[];
    };

const MAX_CART_PAYLOAD = 10_000;
/** Orders allowed per client IP per window (stops scripted fake COD orders draining stock). */
const MAX_ORDERS_PER_WINDOW = 5;
const ORDER_WINDOW_MS = 10 * 60 * 1000;

function parseCartField(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.length > MAX_CART_PAYLOAD) return [];
  try {
    return parseCartLines(JSON.parse(value));
  } catch {
    return [];
  }
}

/** Live price and stock for the cart's products: never cached, never trusted from the client. */
async function loadPurchasable(slugs: string[]): Promise<PurchasableProduct[]> {
  if (slugs.length === 0) return [];
  return db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      unit: products.unit,
      price: products.price,
      stock: products.stock,
    })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .where(and(inArray(products.slug, slugs), eq(products.status, "active"), eq(categories.isActive, true)));
}

/**
 * Places a cash-on-delivery order. Validates the delivery details, re-prices
 * the cart from the database, checks stock and then, in one transaction,
 * decrements stock and writes the order. The `stock >= 0` CHECK constraint
 * makes overselling impossible even when two customers buy the last jar at
 * the same moment: the second transaction fails and is reported as a stock
 * change.
 */
export async function placeOrder(_previous: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const input = readFields(formData, checkoutFields);
  const billing = validateBilling(input);
  const lines = parseCartField(formData.get("cart"));

  const fieldErrors: FieldErrors<CheckoutField> = billing.ok ? {} : { ...billing.fieldErrors };
  if (lines.length === 0) fieldErrors.cart = "Your cart is empty. Add some honey before placing an order.";
  const errorState = (message: string, extra: Partial<Extract<CheckoutState, { status: "error" }>> = {}): CheckoutState => ({
    status: "error",
    message,
    fieldErrors,
    values: input,
    ...extra,
  });

  if (!billing.ok || lines.length === 0) return errorState("Please fix the highlighted fields and try again.");

  const ipHash = await getClientIpHash();
  const [recent] = await db
    .select({ value: count() })
    .from(orders)
    .where(and(eq(orders.ipHash, ipHash), gt(orders.createdAt, new Date(Date.now() - ORDER_WINDOW_MS))));
  if ((recent?.value ?? 0) >= MAX_ORDERS_PER_WINDOW) {
    return errorState("You have placed several orders in a few minutes. Please wait a little, or call us to order.");
  }

  const prepared = prepareOrder(lines, await loadPurchasable(lines.map((line) => line.slug)));
  if (prepared.status === "empty") {
    fieldErrors.cart = "Your cart is empty. Add some honey before placing an order.";
    return errorState(fieldErrors.cart);
  }
  if (prepared.status === "stock") {
    return errorState(describeAdjustments(prepared.adjustments), { stockAdjustments: prepared.adjustments });
  }

  const { totals } = prepared;
  const details = billing.data;
  const orderId = randomUUID();

  try {
    const results = await db.batch([
      db
        .insert(orders)
        .values({
          id: orderId,
          firstName: details.firstName,
          lastName: details.lastName,
          phone: details.phone,
          email: details.email,
          province: details.province,
          city: details.city,
          street: details.street,
          apartment: details.apartment,
          postalCode: details.postalCode,
          notes: details.notes,
          paymentMethod: details.paymentMethod,
          subtotal: totals.subtotal,
          shipping: totals.shipping,
          total: totals.total,
          itemCount: totals.itemCount,
          ipHash,
        })
        .returning({ number: orders.number }),
      db.insert(orderItems).values(
        totals.lines.map((line) => ({
          orderId,
          productId: line.product.id,
          productSlug: line.product.slug,
          productName: line.product.name,
          unit: line.product.unit,
          unitPrice: line.product.price,
          quantity: line.quantity,
          lineTotal: line.lineTotal,
        })),
      ),
      db.insert(orderEvents).values({ orderId, fromStatus: null, toStatus: "pending", actor: "customer" }),
      ...totals.lines.map((line) =>
        db
          .update(products)
          .set({ stock: sql`${products.stock} - ${line.quantity}` })
          .where(eq(products.id, line.product.id)),
      ),
    ]);

    // Stock changed: refresh product pages in the background (stale-while-revalidate).
    revalidateTag(CACHE_TAGS.catalog, "max");

    const number = results[0][0]?.number;
    if (number === undefined) throw new Error("Order insert returned no number");
    return {
      status: "success",
      orderNumber: formatOrderNumber(number),
      total: totals.total,
      phone: details.phone,
      itemCount: totals.itemCount,
    };
  } catch (error) {
    if (isCheckViolation(error, "products_stock_non_negative")) {
      // Someone bought the last units between our check and the write.
      const fresh = prepareOrder(lines, await loadPurchasable(lines.map((line) => line.slug)));
      const adjustments = fresh.status === "stock" ? fresh.adjustments : [];
      return errorState(
        adjustments.length > 0 ? describeAdjustments(adjustments) : "Stock just changed. Please review your cart and try again.",
        { stockAdjustments: adjustments },
      );
    }
    console.error("placeOrder failed", error);
    return errorState("We couldn't place your order just now. Please try again in a moment, or call us to order.");
  }
}
