import { describe, expect, it } from "vitest";
import { seedCatalog } from "@/test/seed-catalog";
import { productStructuredData } from "./product-structured-data";

describe("product structured data", () => {
  it("uses the current product price and availability without unverified reviews or representative images", () => {
    const product = seedCatalog().products[0];
    const markup = productStructuredData({ ...product, stock: 0, images: [{ url: "/illustration.png", alt: "illustration", width: null, height: null, caption: "Representative" }] });
    expect(markup.offers).toMatchObject({ price: (product.price / 100).toFixed(2), priceCurrency: "PKR", availability: "https://schema.org/OutOfStock" });
    expect(markup).not.toHaveProperty("image");
    expect(markup).not.toHaveProperty("aggregateRating");
    expect(productStructuredData({ ...product, images: [{ url: "/photo.png", alt: "photo", width: null, height: null }] }).image).toEqual(["https://www.abdulsamienterprises.com/photo.png"]);
  });
});
