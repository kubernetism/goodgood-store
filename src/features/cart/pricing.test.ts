import { describe, expect, it } from "vitest";
import {
  FREE_SHIPPING_THRESHOLD,
  findStockIssues,
  MAX_LINE_QUANTITY,
  SHIPPING_FEE,
  parseCartLines,
  priceCart,
  type CartProduct,
} from "./pricing";

const product = (overrides: Partial<CartProduct> & Pick<CartProduct, "slug" | "price">): CartProduct => ({
  name: overrides.slug,
  category: "acacia",
  unit: "250 g",
  stock: 10,
  image: null,
  ...overrides,
});

const catalog = new Map<string, CartProduct>([
  ["acacia", product({ slug: "acacia", name: "Acacia Honey", price: 115_000 })],
  ["sidr", product({ slug: "sidr", name: "Sidr Honey", price: 465_000, category: "sidr", unit: "500 g" })],
]);

describe("parseCartLines", () => {
  it("rejects anything that is not an array", () => {
    expect(parseCartLines(null)).toEqual([]);
    expect(parseCartLines({ slug: "acacia", quantity: 1 })).toEqual([]);
  });

  it("drops malformed lines", () => {
    expect(
      parseCartLines([
        { slug: "acacia", quantity: 2 },
        { slug: "", quantity: 1 },
        { slug: "comb", quantity: 0 },
        { slug: "sidr", quantity: 1.5 },
        { slug: 42, quantity: 1 },
        "acacia",
      ]),
    ).toEqual([{ slug: "acacia", quantity: 2 }]);
  });

  it("merges duplicate slugs and caps the quantity", () => {
    expect(
      parseCartLines([
        { slug: "acacia", quantity: 60 },
        { slug: "acacia", quantity: 60 },
      ]),
    ).toEqual([{ slug: "acacia", quantity: MAX_LINE_QUANTITY }]);
  });
});

describe("priceCart", () => {
  it("uses PKR thresholds: free over Rs 5,000, otherwise Rs 250", () => {
    expect(FREE_SHIPPING_THRESHOLD).toBe(500_000);
    expect(SHIPPING_FEE).toBe(25_000);
  });

  it("charges shipping below the free-shipping threshold", () => {
    const totals = priceCart([{ slug: "acacia", quantity: 2 }], catalog);
    expect(totals).toMatchObject({
      subtotal: 230_000,
      shipping: SHIPPING_FEE,
      total: 230_000 + SHIPPING_FEE,
      itemCount: 2,
    });
  });

  it("ships free at or above the threshold", () => {
    const totals = priceCart([{ slug: "sidr", quantity: 2 }], catalog);
    expect(totals.subtotal).toBeGreaterThanOrEqual(FREE_SHIPPING_THRESHOLD);
    expect(totals.shipping).toBe(0);
  });

  it("treats exactly Rs 5,000 as free shipping", () => {
    const exact = new Map<string, CartProduct>([
      ["box", product({ slug: "box", name: "Box", price: 250_000, category: "gift-sets", unit: "1 box" })],
    ]);
    expect(priceCart([{ slug: "box", quantity: 2 }], exact).shipping).toBe(0);
    expect(priceCart([{ slug: "box", quantity: 1 }], exact).shipping).toBe(SHIPPING_FEE);
  });

  it("ignores lines for unknown products and charges nothing for an empty cart", () => {
    const totals = priceCart([{ slug: "ghost", quantity: 3 }], catalog);
    expect(totals).toEqual({ lines: [], itemCount: 0, subtotal: 0, shipping: 0, total: 0 });
  });
});

describe("findStockIssues", () => {
  const stocked = new Map([
    ["acacia", { name: "Acacia Honey", stock: 3 }],
    ["sidr", { name: "Sidr Honey", stock: 0 }],
  ]);

  it("passes lines that fit the available stock", () => {
    expect(findStockIssues([{ slug: "acacia", quantity: 3 }], stocked)).toEqual([]);
  });

  it("reports lines over stock, sold-out lines and unknown products", () => {
    expect(
      findStockIssues(
        [
          { slug: "acacia", quantity: 5 },
          { slug: "sidr", quantity: 1 },
          { slug: "ghost", quantity: 2 },
        ],
        stocked,
      ),
    ).toEqual([
      { slug: "acacia", name: "Acacia Honey", requested: 5, available: 3 },
      { slug: "sidr", name: "Sidr Honey", requested: 1, available: 0 },
      { slug: "ghost", name: "ghost", requested: 2, available: 0 },
    ]);
  });
});
