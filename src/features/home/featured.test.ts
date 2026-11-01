import { describe, expect, it } from "vitest";
import { seedCatalog } from "@/test/seed-catalog";
import type { Catalog, Product } from "@/features/products/types";
import { pickFeaturedProducts, pickHeroProduct } from "./featured";

const base = seedCatalog().products[0]!;

function product(slug: string, overrides: Partial<Product> = {}): Product {
  return { ...base, id: slug, slug, name: slug, tags: [], stock: 10, rating: 4, reviewCount: 10, ...overrides };
}

function catalogOf(...products: Product[]): Catalog {
  return { categories: seedCatalog().categories, products };
}

describe("pickFeaturedProducts", () => {
  it("puts tagged best sellers ahead of higher-rated jars", () => {
    const catalog = catalogOf(
      product("top-rated", { rating: 5 }),
      product("best-seller", { rating: 4, tags: ["Best Seller"] }),
    );
    expect(pickFeaturedProducts(catalog, 2).map((p) => p.slug)).toEqual(["best-seller", "top-rated"]);
  });

  it("keeps top-rated order within a group", () => {
    const catalog = catalogOf(product("good", { rating: 4.2 }), product("great", { rating: 4.9 }), product("fine", { rating: 3.8 }));
    expect(pickFeaturedProducts(catalog, 3).map((p) => p.slug)).toEqual(["great", "good", "fine"]);
  });

  it("only shows sold-out jars after everything in stock", () => {
    const catalog = catalogOf(
      product("sold-out-best-seller", { stock: 0, rating: 5, tags: ["Best Seller"] }),
      product("in-stock", { rating: 3 }),
    );
    expect(pickFeaturedProducts(catalog, 2).map((p) => p.slug)).toEqual(["in-stock", "sold-out-best-seller"]);
  });

  it("respects the limit and an empty catalogue", () => {
    expect(pickFeaturedProducts(catalogOf(product("a"), product("b"), product("c")), 2)).toHaveLength(2);
    expect(pickFeaturedProducts(catalogOf(), 4)).toEqual([]);
  });
});

describe("pickHeroProduct", () => {
  it("uses the banner's linked product when it is in stock", () => {
    const catalog = catalogOf(product("pick", { rating: 5 }), product("linked", { rating: 2 }));
    expect(pickHeroProduct(catalog, "linked")?.slug).toBe("linked");
  });

  it("falls back to an in-stock best seller when the link is missing or sold out", () => {
    const catalog = catalogOf(product("top", { rating: 5 }), product("best", { rating: 3, tags: ["Best Seller"] }), product("linked", { stock: 0 }));
    expect(pickHeroProduct(catalog, "linked")?.slug).toBe("best");
    expect(pickHeroProduct(catalog, "nope")?.slug).toBe("best");
    expect(pickHeroProduct(catalog, null)?.slug).toBe("best");
  });

  it("otherwise leads with the first category in the admin's order", () => {
    const [first, second] = seedCatalog().categories;
    const catalog = catalogOf(
      product("side-line", { category: second!.slug, rating: 5 }),
      product("headline-low", { category: first!.slug, rating: 3 }),
      product("headline-high", { category: first!.slug, rating: 4 }),
      product("headline-sold-out", { category: first!.slug, rating: 5, stock: 0 }),
    );
    expect(pickHeroProduct(catalog, null)?.slug).toBe("headline-high");
  });

  it("shows no jar when nothing can be bought", () => {
    expect(pickHeroProduct(catalogOf(product("gone", { stock: 0 })), null)).toBeNull();
    expect(pickHeroProduct(catalogOf(), null)).toBeNull();
  });
});
