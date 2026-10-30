import { describe, expect, it } from "vitest";
import { seedCatalog } from "@/test/seed-catalog";
import { catalogNavigation } from "./catalog-navigation";

describe("shop navigation", () => {
  const catalog = seedCatalog();
  it("only includes categories represented by visible products", () => {
    const product = catalog.products[0];
    const shop = catalogNavigation({ ...catalog, products: [product] }).find((item) => item.label === "Shop");
    expect(shop?.children).toEqual([
      { label: "All Honey", href: "/shop" },
      { label: product.categoryName, href: `/shop?category=${product.category}` },
    ]);
  });
  it("keeps the all-products link when there are no visible products", () => {
    const shop = catalogNavigation({ ...catalog, products: [] }).find((item) => item.label === "Shop");
    expect(shop?.children).toEqual([{ label: "All Honey", href: "/shop" }]);
  });
});
