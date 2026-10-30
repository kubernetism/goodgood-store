import type { ImageAsset } from "@/features/products/types";

/**
 * Cart maths shared by the client (display) and the checkout Server Action
 * (authoritative re-pricing). Amounts are integer paisa (Rs 1 = 100 paisa).
 */

export const MAX_LINE_QUANTITY = 99;
export const MAX_CART_LINES = 50;
/** Rs 5,000: orders at or above this ship free anywhere in Pakistan. */
export const FREE_SHIPPING_THRESHOLD = 500_000;
/** Rs 250 flat delivery fee below the threshold. */
export const SHIPPING_FEE = 25_000;

export type CartLine = { slug: string; quantity: number };

/** Split saved items against the currently available storefront catalogue. */
export function partitionCartLines(lines: ReadonlyArray<CartLine>, availableSlugs: ReadonlySet<string>) {
  const available: CartLine[] = [];
  const unavailable: CartLine[] = [];
  for (const line of lines) {
    (availableSlugs.has(line.slug) ? available : unavailable).push(line);
  }
  return { available, unavailable };
}

/** The slice of a product the cart needs; keeps client payloads small. */
export type CartProduct = {
  slug: string;
  name: string;
  /** Paisa. */
  price: number;
  /** Category slug (picks the placeholder glyph when there is no image). */
  category: string;
  unit: string;
  /** Units available; the cart caps quantities to it and checkout re-checks it. */
  stock: number;
  image: ImageAsset | null;
};

/** Anything with a price can be priced: cart UI products and checkout's DB rows alike. */
export type Priceable = { price: number };

export type PricedLine<P extends Priceable = CartProduct> = CartLine & { product: P; lineTotal: number };

export type CartTotals<P extends Priceable = CartProduct> = {
  lines: PricedLine<P>[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Parses untrusted cart data (localStorage or a form field) into valid lines:
 * known shape only, quantities clamped to 1..99, duplicate slugs merged.
 */
export function parseCartLines(input: unknown): CartLine[] {
  if (!Array.isArray(input)) return [];

  const merged = new Map<string, number>();
  for (const item of input) {
    if (!isRecord(item)) continue;
    const { slug, quantity } = item;
    if (typeof slug !== "string" || slug.length === 0 || slug.length > 100) continue;
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) continue;
    merged.set(slug, Math.min(MAX_LINE_QUANTITY, (merged.get(slug) ?? 0) + quantity));
    if (merged.size >= MAX_CART_LINES) break;
  }

  return [...merged].map(([slug, quantity]) => ({ slug, quantity }));
}

export function shippingFor(subtotal: number): number {
  return subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

/** Prices lines against the catalogue; lines for unknown products are dropped. */
export function priceCart<P extends Priceable>(
  lines: ReadonlyArray<CartLine>,
  catalog: ReadonlyMap<string, P>,
): CartTotals<P> {
  const priced: PricedLine<P>[] = [];
  for (const line of lines) {
    const product = catalog.get(line.slug);
    if (!product) continue;
    priced.push({ ...line, product, lineTotal: product.price * line.quantity });
  }

  const subtotal = priced.reduce((sum, line) => sum + line.lineTotal, 0);
  const shipping = shippingFor(subtotal);

  return {
    lines: priced,
    itemCount: priced.reduce((sum, line) => sum + line.quantity, 0),
    subtotal,
    shipping,
    total: subtotal + shipping,
  };
}

/** A cart line that can't be fulfilled as-is: reduce it to `available` (0 = remove). */
export type StockAdjustment = { slug: string; name: string; requested: number; available: number };

/**
 * Lines asking for more than is in stock. Unknown products are reported with
 * `available: 0` and the slug as name, so the cart can drop them.
 */
export function findStockIssues(
  lines: ReadonlyArray<CartLine>,
  catalog: ReadonlyMap<string, Pick<CartProduct, "name" | "stock">>,
): StockAdjustment[] {
  const issues: StockAdjustment[] = [];
  for (const line of lines) {
    const product = catalog.get(line.slug);
    const available = Math.max(0, product?.stock ?? 0);
    if (line.quantity > available) {
      issues.push({ slug: line.slug, name: product?.name ?? line.slug, requested: line.quantity, available });
    }
  }
  return issues;
}
