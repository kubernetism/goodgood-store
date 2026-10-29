import { findStockIssues, priceCart, type CartLine, type CartTotals, type StockAdjustment } from "@/features/cart/pricing";

/*
 * Pure order preparation for checkout: price the cart against fresh database
 * rows and check stock. The Server Action does the I/O around it.
 */

/** A product row as checkout reads it (always uncached, straight from the DB). */
export type PurchasableProduct = { id: string; slug: string; name: string; unit: string; price: number; stock: number };

export type PreparedOrder =
  | { status: "empty" }
  | { status: "stock"; adjustments: StockAdjustment[] }
  | { status: "ok"; totals: CartTotals<PurchasableProduct> };

export function prepareOrder(lines: ReadonlyArray<CartLine>, rows: ReadonlyArray<PurchasableProduct>): PreparedOrder {
  if (lines.length === 0) return { status: "empty" };
  const bySlug = new Map(rows.map((row) => [row.slug, row]));

  const adjustments = findStockIssues(lines, bySlug);
  if (adjustments.length > 0) return { status: "stock", adjustments };

  const totals = priceCart(lines, bySlug);
  return totals.lines.length === 0 ? { status: "empty" } : { status: "ok", totals };
}

/** One sentence per adjustment, for the checkout error message. */
export function describeAdjustments(adjustments: ReadonlyArray<StockAdjustment>): string {
  return adjustments
    .map((item) =>
      item.available === 0
        ? `${item.name} is sold out and was removed from your cart.`
        : `Only ${item.available} of ${item.name} ${item.available === 1 ? "is" : "are"} left, so we updated your cart.`,
    )
    .join(" ");
}
