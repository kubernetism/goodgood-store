import { describe, expect, it } from "vitest";
import { getCartCatalog } from "@/features/products/catalog";
import { priceCart, SHIPPING_FEE } from "@/features/cart/pricing";
import { seedCatalog } from "@/test/seed-catalog";
import { describeAdjustments, prepareOrder, type PurchasableProduct } from "./prepare";

const rows: PurchasableProduct[] = [
  { id: "a", slug: "sidr-honey-500g", name: "Sidr Honey 500 g", unit: "500 g", price: 465_000, stock: 10 },
  { id: "b", slug: "acacia-honey-250g", name: "Acacia Honey 250 g", unit: "250 g", price: 115_000, stock: 1 },
];

describe("prepareOrder", () => {
  it("prices from database rows, ignoring anything the client sent", () => {
    const result = prepareOrder([{ slug: "sidr-honey-500g", quantity: 2 }], rows);
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.totals).toMatchObject({ subtotal: 930_000, shipping: 0, total: 930_000, itemCount: 2 });
    expect(result.totals.lines[0]?.product.id).toBe("a");
  });

  it("charges shipping under Rs 5,000", () => {
    const result = prepareOrder([{ slug: "acacia-honey-250g", quantity: 1 }], rows);
    expect(result.status === "ok" && result.totals.total).toBe(115_000 + SHIPPING_FEE);
  });

  it("reports stock problems instead of pricing", () => {
    const result = prepareOrder(
      [
        { slug: "acacia-honey-250g", quantity: 3 },
        { slug: "archived-product", quantity: 1 },
      ],
      rows,
    );
    expect(result).toEqual({
      status: "stock",
      adjustments: [
        { slug: "acacia-honey-250g", name: "Acacia Honey 250 g", requested: 3, available: 1 },
        { slug: "archived-product", name: "archived-product", requested: 1, available: 0 },
      ],
    });
    if (result.status === "stock") {
      expect(describeAdjustments(result.adjustments)).toBe(
        "Only 1 of Acacia Honey 250 g is left, so we updated your cart. archived-product is sold out and was removed from your cart.",
      );
    }
  });

  it("treats an empty cart as empty", () => {
    expect(prepareOrder([], rows)).toEqual({ status: "empty" });
  });
});

describe("cart pricing with database-shaped catalogue data", () => {
  it("prices the cart payload built from the loaded catalogue", () => {
    const cartCatalog = new Map(getCartCatalog(seedCatalog()).map((product) => [product.slug, product]));
    const totals = priceCart([{ slug: "sidr-honey-500g", quantity: 1 }], cartCatalog);
    expect(totals.subtotal).toBe(465_000);
    expect(totals.lines[0]?.product).toMatchObject({ stock: 25, image: null, category: "sidr" });
  });
});
