/**
 * Storefront catalogue types: the plain, serializable shapes the database
 * loader produces (see ./catalog-data.ts) and the pure catalogue helpers in
 * ./catalog.ts consume. Prices are integer paisa (Rs 1 = 100 paisa).
 */

/**
 * Fixed tag vocabulary. Tags drive the shop's "Filter by tag" links, so they
 * are a closed list (checkboxes in the admin) rather than free text.
 */
export const productTags = [
  "Raw",
  "Unfiltered",
  "Organic",
  "Single Origin",
  "Best Seller",
  "Seasonal",
  "Limited",
  "Gift",
] as const;

export type ProductTag = (typeof productTags)[number];

export function isProductTag(value: string): value is ProductTag {
  return (productTags as ReadonlyArray<string>).includes(value);
}

/** An uploaded image, ready for next/image. */
export type ImageAsset = {
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
  /** Disclosure for illustrative range imagery rather than exact pack shots. */
  caption?: string;
};

export type CategoryHighlight = { title: string; text: string };

export type Category = {
  slug: string;
  name: string;
  blurb: string;
  highlights: ReadonlyArray<CategoryHighlight>;
  image: ImageAsset | null;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  /** Category slug. */
  category: string;
  categoryName: string;
  /** Current price in paisa. */
  price: number;
  /** "Was" price in paisa, only when on sale. */
  compareAtPrice?: number;
  /** Units available to order right now. */
  stock: number;
  /** 0–5 average rating. */
  rating: number;
  reviewCount: number;
  /** Net weight or pack contents, e.g. "500 g". */
  unit: string;
  origin: string;
  harvest: string;
  floralSource: string;
  tasteNotes: string;
  summary: string;
  description: string;
  tags: ReadonlyArray<ProductTag>;
  /** ISO date the product was listed; drives "Newest" sorting. */
  listedOn: string;
  /** Gallery in display order; the first is the primary image. */
  images: ReadonlyArray<ImageAsset>;
};

/** Everything the storefront needs about the catalogue, loaded in one cached read. */
export type Catalog = {
  /** Active categories in display order. */
  categories: ReadonlyArray<Category>;
  /** Active products in catalogue ("Default sorting") order. */
  products: ReadonlyArray<Product>;
};
