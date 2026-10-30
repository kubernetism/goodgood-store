import { describe, expect, it } from "vitest";
import { seedCatalog } from "@/test/seed-catalog";
import { shopMetadata } from "./shop-metadata";

const catalog = seedCatalog();

describe("shop search metadata", () => {
  it("uses distinct canonical URLs for categories and paginated results", () => {
    expect(shopMetadata({ category: "sidr" }, catalog)).toMatchObject({
      title: "Shop Sidr | Honey in Pakistan",
      alternates: { canonical: "/shop?category=sidr" },
      robots: { index: true },
    });
    expect(shopMetadata({ page: "2" }, catalog).alternates).toEqual({ canonical: "/shop?page=2" });
  });

  it("keeps search, filters, sorts and empty or unknown categories out of search results", () => {
    for (const params of [{ q: "honey" }, { tag: "Raw" }, { min: "100" }, { sort: "price-asc" }, { category: "unknown" }]) {
      expect(shopMetadata(params, catalog).robots).toMatchObject({ index: false, follow: true });
    }
    const emptyCatalog = { ...catalog, products: catalog.products.filter((product) => product.category !== "sidr") };
    expect(shopMetadata({ category: "sidr" }, emptyCatalog).robots).toMatchObject({ index: false });
    expect(shopMetadata({}, emptyCatalog).robots).toMatchObject({ index: true });
  });
});
