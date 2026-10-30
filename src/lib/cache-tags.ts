/**
 * Cache tags for storefront reads (`cacheTag`) and their invalidation after
 * admin edits (`updateTag` in Server Actions) or orders (`revalidateTag`).
 */
export const CACHE_TAGS = {
  /** Products, categories, product images and stock. */
  catalog: "catalog",
  /** Content slots (site images and videos). */
  content: "content",
  /** Promo banners. */
  banners: "banners",
  blog: "blog",
  testimonials: "testimonials",
  settings: "store-settings",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];
