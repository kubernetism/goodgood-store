import { describe, expect, it } from "vitest";
import { PRICE_FILTER_STEP, getAllProducts, getPriceBounds, getTopRatedProducts, queryProducts } from "./catalog";
import { categories } from "./data";
import { defaultShopQuery, type ShopQuery } from "./shop-query";

const query = (overrides: Partial<ShopQuery> = {}): ShopQuery => ({ ...defaultShopQuery, ...overrides });

describe("queryProducts", () => {
  it("pages the full catalogue nine at a time", () => {
    const total = getAllProducts().length;
    const first = queryProducts(query());

    expect(first.items).toHaveLength(9);
    expect(first).toMatchObject({ total, page: 1, start: 1, end: 9, pageCount: Math.ceil(total / 9) });
  });

  it("clamps an out-of-range page to the last page", () => {
    const result = queryProducts(query({ page: 99 }));
    expect(result.page).toBe(result.pageCount);
    expect(result.end).toBe(result.total);
  });

  it("filters by category", () => {
    const result = queryProducts(query({ category: "sidr" }), 100);
    expect(result.total).toBeGreaterThan(0);
    expect(result.items.every((product) => product.category === "sidr")).toBe(true);
  });

  it("filters by an inclusive whole-rupee price range against paisa prices", () => {
    const result = queryProducts(query({ minPrice: 1000, maxPrice: 2000 }), 100);
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.every((product) => product.price >= 100_000 && product.price <= 200_000)).toBe(true);
  });

  it("includes products priced exactly on a bound", () => {
    // Acacia 500 g is Rs 2,150.
    const result = queryProducts(query({ minPrice: 2150, maxPrice: 2150 }), 100);
    expect(result.items.map((p) => p.slug)).toContain("acacia-honey-500g");
  });

  it("filters by tag and case-insensitive search", () => {
    expect(queryProducts(query({ tag: "Gift" }), 100).items.every((p) => p.tags.includes("Gift"))).toBe(true);
    expect(queryProducts(query({ q: "SIDR" }), 100).items.map((p) => p.slug)).toContain("sidr-honey-500g");
  });

  it("searches origin and floral source too", () => {
    const slugs = queryProducts(query({ q: "karak" }), 100).items.map((p) => p.slug);
    expect(slugs).toContain("karak-reserve-sidr");
    expect(slugs).toContain("honeycomb-in-sidr-honey");
  });

  it("sorts by price in both directions", () => {
    const ascending = queryProducts(query({ sort: "price-asc" }), 100).items.map((p) => p.price);
    const descending = queryProducts(query({ sort: "price-desc" }), 100).items.map((p) => p.price);
    expect(ascending).toEqual([...ascending].sort((a, b) => a - b));
    expect(descending).toEqual([...ascending].reverse());
  });

  it("returns an empty, well-formed page when nothing matches", () => {
    expect(queryProducts(query({ q: "zzz-no-match" }))).toEqual({
      items: [],
      total: 0,
      page: 1,
      pageCount: 1,
      start: 0,
      end: 0,
    });
  });
});

describe("catalogue helpers", () => {
  it("ranks top rated by rating, then review count", () => {
    const [first, second] = getTopRatedProducts(2);
    expect(first.rating).toBeGreaterThanOrEqual(second.rating);
  });

  it("derives step-aligned whole-rupee price bounds that contain every product", () => {
    const { min, max } = getPriceBounds();
    expect(min % PRICE_FILTER_STEP).toBe(0);
    expect(max % PRICE_FILTER_STEP).toBe(0);
    for (const product of getAllProducts()) {
      expect(product.price).toBeGreaterThanOrEqual(min * 100);
      expect(product.price).toBeLessThanOrEqual(max * 100);
    }
  });

  it("stores every price as whole rupees in paisa", () => {
    for (const product of getAllProducts()) {
      expect(Number.isInteger(product.price / 100)).toBe(true);
      if (product.compareAtPrice !== undefined) {
        expect(Number.isInteger(product.compareAtPrice / 100)).toBe(true);
        expect(product.compareAtPrice).toBeGreaterThan(product.price);
      }
    }
  });

  it("stocks every category with honey-relevant details", () => {
    for (const category of categories) {
      expect(getAllProducts().some((product) => product.category === category.slug)).toBe(true);
    }
    for (const product of getAllProducts()) {
      expect(product.origin && product.harvest && product.floralSource && product.unit).toBeTruthy();
    }
  });

  it("has unique product slugs", () => {
    const slugs = getAllProducts().map((product) => product.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
