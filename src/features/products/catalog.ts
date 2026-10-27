import { categories, products, type Category, type CategorySlug, type Product } from "./data";
import type { ShopQuery, SortKey } from "./shop-query";
import type { CartProduct } from "@/features/cart/pricing";

export const SHOP_PAGE_SIZE = 9;

/** Price filter granularity, in whole rupees. Bounds are rounded to it so every slider stop is reachable. */
export const PRICE_FILTER_STEP = 100;

export function getAllProducts(): ReadonlyArray<Product> {
  return products;
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getCategory(slug: CategorySlug): Category {
  // `categories` is the source of CategorySlug, so a match always exists.
  return categories.find((category) => category.slug === slug) ?? categories[0];
}

export function getProductsByCategory(slug: CategorySlug, limit = Infinity): Product[] {
  return products.filter((product) => product.category === slug).slice(0, limit);
}

export function getCategoryCounts(): Array<Category & { count: number }> {
  return categories.map((category) => ({
    ...category,
    count: products.filter((product) => product.category === category.slug).length,
  }));
}

/** Highest-rated first; review volume breaks ties so one 5★ review doesn't win. */
export function getTopRatedProducts(limit: number): Product[] {
  return [...products].sort(compareBy("rating")).slice(0, limit);
}

export function getFeaturedProducts(limit: number): Product[] {
  return products.filter((product) => product.tags.includes("Best Seller")).slice(0, limit);
}

export function getRelatedProducts(product: Product, limit: number): Product[] {
  const sameCategory = products.filter((p) => p.category === product.category && p.slug !== product.slug);
  const others = products.filter((p) => p.category !== product.category);
  return [...sameCategory, ...others].slice(0, limit);
}

/**
 * Whole-rupee bounds of the catalogue for the price filter, widened to
 * multiples of PRICE_FILTER_STEP. Prices are stored in paisa.
 */
export function getPriceBounds(): { min: number; max: number } {
  const rupees = products.map((product) => product.price / 100);
  return {
    min: Math.floor(Math.min(...rupees) / PRICE_FILTER_STEP) * PRICE_FILTER_STEP,
    max: Math.ceil(Math.max(...rupees) / PRICE_FILTER_STEP) * PRICE_FILTER_STEP,
  };
}

function compareBy(sort: SortKey): (a: Product, b: Product) => number {
  switch (sort) {
    case "popularity":
      return (a, b) => b.reviewCount - a.reviewCount;
    case "rating":
      return (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount;
    case "newest":
      return (a, b) => b.listedOn.localeCompare(a.listedOn);
    case "price-asc":
      return (a, b) => a.price - b.price;
    case "price-desc":
      return (a, b) => b.price - a.price;
    case "default":
      return () => 0;
    default: {
      const exhaustive: never = sort;
      return exhaustive;
    }
  }
}

function matchesQuery(product: Product, query: ShopQuery): boolean {
  if (query.category && product.category !== query.category) return false;
  if (query.tag && !product.tags.includes(query.tag)) return false;
  // Filter bounds are whole rupees; product prices are paisa.
  if (query.minPrice !== null && product.price < query.minPrice * 100) return false;
  if (query.maxPrice !== null && product.price > query.maxPrice * 100) return false;
  if (query.q) {
    const needle = query.q.toLowerCase();
    const haystack =
      `${product.name} ${product.summary} ${product.origin} ${product.floralSource} ${product.tags.join(" ")}`.toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  return true;
}

export type ProductPage = {
  items: Product[];
  total: number;
  /** Page actually shown (clamped into range). */
  page: number;
  pageCount: number;
  /** 1-based index of the first and last item shown; 0 when empty. */
  start: number;
  end: number;
};

export function queryProducts(query: ShopQuery, pageSize = SHOP_PAGE_SIZE): ProductPage {
  // Array.prototype.sort is stable, so "default" keeps catalogue order.
  const matches = products.filter((product) => matchesQuery(product, query)).sort(compareBy(query.sort));
  const total = matches.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(query.page, pageCount);
  const offset = (page - 1) * pageSize;
  const items = matches.slice(offset, offset + pageSize);

  return {
    items,
    total,
    page,
    pageCount,
    start: total === 0 ? 0 : offset + 1,
    end: offset + items.length,
  };
}

/** Minimal product shape for cart UIs and checkout re-pricing. */
export function getCartCatalog(): CartProduct[] {
  return products.map(({ slug, name, price, category, unit }) => ({ slug, name, price, category, unit }));
}
