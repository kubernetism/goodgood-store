import { isProductTag, type Catalog, type ImageAsset } from "./types";

/*
 * Turns flat database rows into the storefront Catalog. Pure (no DB access)
 * so it can be unit tested; the cached loader lives in ./catalog-data.ts.
 */

export type MediaRow = { url: string; alt: string; width: number | null; height: number | null };

export type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  blurb: string;
  highlights: ReadonlyArray<{ title: string; text: string }>;
  image: MediaRow | null;
};

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  rating: number;
  reviewCount: number;
  unit: string;
  origin: string;
  harvest: string;
  floralSource: string;
  tasteNotes: string;
  summary: string;
  description: string;
  tags: ReadonlyArray<string>;
  listedOn: string;
};

export type ProductImageRow = { productId: string; position: number; media: MediaRow };

export function toImageAsset(row: MediaRow): ImageAsset {
  return { url: row.url, alt: row.alt, width: row.width, height: row.height };
}

/**
 * Rows must already be filtered to what the storefront may show and sorted
 * (categories and products by sort order). Products whose category is not in
 * `categories` (e.g. a hidden category) are dropped.
 */
export function assembleCatalog(
  categoryRows: ReadonlyArray<CategoryRow>,
  productRows: ReadonlyArray<ProductRow>,
  imageRows: ReadonlyArray<ProductImageRow>,
): Catalog {
  const categoriesById = new Map(categoryRows.map((row) => [row.id, row]));

  const imagesByProduct = new Map<string, ProductImageRow[]>();
  for (const image of imageRows) {
    const list = imagesByProduct.get(image.productId) ?? [];
    list.push(image);
    imagesByProduct.set(image.productId, list);
  }

  const products = productRows.flatMap((row) => {
    const category = categoriesById.get(row.categoryId);
    if (!category) return [];
    const images = (imagesByProduct.get(row.id) ?? [])
      .sort((a, b) => a.position - b.position)
      .map((image) => toImageAsset(image.media));
    return [
      {
        id: row.id,
        slug: row.slug,
        name: row.name,
        category: category.slug,
        categoryName: category.name,
        price: row.price,
        // A stale "was" price that is not above the price is dropped rather than shown as a negative discount.
        ...(row.compareAtPrice !== null && row.compareAtPrice > row.price ? { compareAtPrice: row.compareAtPrice } : {}),
        stock: Math.max(0, row.stock),
        rating: row.rating,
        reviewCount: row.reviewCount,
        unit: row.unit,
        origin: row.origin,
        harvest: row.harvest,
        floralSource: row.floralSource,
        tasteNotes: row.tasteNotes,
        summary: row.summary,
        description: row.description,
        tags: row.tags.filter(isProductTag),
        listedOn: row.listedOn,
        images,
      },
    ];
  });

  return {
    categories: categoryRows.map((row) => ({
      slug: row.slug,
      name: row.name,
      blurb: row.blurb,
      highlights: row.highlights,
      image: row.image ? toImageAsset(row.image) : null,
    })),
    products,
  };
}
