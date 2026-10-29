import type { Catalog, ImageAsset, Product } from "./types";

type RangeImages = Record<"honey" | "wildHoney" | "honeyNuts" | "saffron", ImageAsset>;

// These are range photographs, not verified pack shots for every SKU. Keep
// that distinction visible and never replace a product's admin-uploaded photo.
function rangeImage(product: Product, images: RangeImages): ImageAsset {
  if (product.slug === "eid-gift-hamper" || product.slug === "signature-wooden-gift-box") return images.saffron;
  if (product.category === "gift-sets") return images.honeyNuts;
  if (product.category === "honeycomb" || product.category === "wildflower" || product.category === "black-forest") return images.wildHoney;
  return images.honey;
}

export function withLocalCatalogImages(catalog: Catalog, images: RangeImages): Catalog {
  return {
    categories: catalog.categories.map((category) => ({
      ...category,
      image: category.image ?? (
        category.slug === "gift-sets" ? images.honeyNuts :
        ["honeycomb", "wildflower", "black-forest"].includes(category.slug) ? images.wildHoney : images.honey
      ),
    })),
    products: catalog.products.map((product) => product.images.length ? product : {
      ...product,
      images: [{
        ...rangeImage(product, images),
        caption: "Representative range image. Check the description for this product’s contents and size.",
      }],
    }),
  };
}
