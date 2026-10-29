import { describe, expect, it } from "vitest";
import { seedCatalog } from "@/test/seed-catalog";
import type { ImageAsset } from "./types";
import { withLocalCatalogImages } from "./local-catalog-images";

const image = (name: string): ImageAsset => ({ url: `/${name}.png`, alt: name, width: 1200, height: 1100 });
const images = { honey: image("honey"), wildHoney: image("wildHoney"), honeyNuts: image("honeyNuts"), saffron: image("saffron") };

describe("local catalogue photography", () => {
  it("uses all four supplied product photos with a visible disclosure", () => {
    const catalog = withLocalCatalogImages(seedCatalog(), images);
    expect(new Set(catalog.products.map((product) => product.images[0].url))).toEqual(new Set(Object.values(images).map((asset) => asset.url)));
    expect(catalog.products.every((product) => product.images[0].caption?.startsWith("Representative range image"))).toBe(true);
    expect(catalog.categories.every((category) => category.image)).toBe(true);
  });

  it("preserves uploaded photos and all commerce data", () => {
    const original = seedCatalog();
    const uploaded = image("admin-photo");
    const source = { ...original, products: original.products.map((product, i) => i === 0 ? { ...product, images: [uploaded] } : product) };
    const result = withLocalCatalogImages(source, images);
    expect(result.products[0].images).toEqual([uploaded]);
    expect(result.products.map((product) => ({ ...product, images: [] }))).toEqual(source.products.map((product) => ({ ...product, images: [] })));
    expect(original.products[0].images).toEqual([]);
  });

  it("preserves category artwork and handles an empty catalogue", () => {
    const catalog = seedCatalog();
    const uploaded = image("category");
    const source = { ...catalog, categories: catalog.categories.map((category) => ({ ...category, image: uploaded })) };
    expect(withLocalCatalogImages(source, images).categories.every((category) => category.image === uploaded)).toBe(true);
    expect(withLocalCatalogImages({ categories: [], products: [] }, images)).toEqual({ categories: [], products: [] });
  });
});
