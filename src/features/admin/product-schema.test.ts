import { describe, expect, it } from "vitest";
import { productFormSchema } from "./product-schema";

const product = { name: "Sidr Honey", slug: "sidr-honey", categoryId: "7f1d2c3b-4a5e-4f60-8a7b-9c0d1e2f3a4b", status: "active", price: "2450.50", compareAtPrice: "3000", stock: "5", rating: "4.5", reviewCount: "3", unit: "250 g", origin: "Karak", harvest: "Autumn", floralSource: "Sidr", tasteNotes: "Rich", summary: "Honey", description: "Raw honey", listedOn: "2026-10-01", sortOrder: "0", tags: ["Raw"], imageIds: [] };

describe("product form validation", () => {
  it("converts rupees to integer paisa", () => expect(productFormSchema.parse(product)).toMatchObject({ price: 245050, compareAtPrice: 300000, stock: 5 }));
  it("rejects prices with fractional paisa and compare-at prices below the price", () => {
    expect(productFormSchema.safeParse({ ...product, price: "2.005" }).success).toBe(false);
    expect(productFormSchema.safeParse({ ...product, compareAtPrice: "100" }).success).toBe(false);
  });
  it("rejects negative stock, malformed slugs and unknown tags", () => {
    for (const change of [{ stock: "-1" }, { slug: "Bad Slug" }, { tags: ["Fake"] }]) expect(productFormSchema.safeParse({ ...product, ...change }).success).toBe(false);
  });
});
