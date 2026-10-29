import type { CartProduct } from "@/features/cart/pricing";
import type { ShopQuery, SortKey } from "./shop-query";
import type { Catalog, Category, Product } from "./types";

/*
 * Pure catalogue queries over a loaded Catalog (see ./catalog-data.ts for the
 * cached database read). The whole active catalogue is small (tens of
 * products), so filtering, sorting and paging in memory is simpler and faster
 * than a query per page. Move these into SQL if the range grows past ~1,000.
 */

export const SHOP_PAGE_SIZE = 9;

/** Price filter granularity, in whole rupees. Bounds are rounded to it so every slider stop is reachable. */
export const PRICE_FILTER_STEP = 100;

export function getProductBySlug(catalog: Catalog, slug: string): Product | undefined {
  return catalog.products.find((product) => product.slug === slug);
}

export function getCategory(catalog: Catalog, slug: string): Category | undefined {
  return catalog.categories.find((category) => category.slug === slug);
}

export function getProductsByCategory(catalog: Catalog, slug: string, limit = Infinity): Product[] {
  return catalog.products.filter((product) => product.category === slug).slice(0, limit);
}

export function getCategoryCounts(catalog: Catalog): Array<Category & { count: number }> {
  return catalog.categories.map((category) => ({
    ...category,
    count: catalog.products.filter((product) => product.category === category.slug).length,
  }));
}

/** Highest-rated first; review volume breaks ties so one 5★ review doesn't win. */
export function getTopRatedProducts(catalog: Catalog, limit: number): Product[] {
  return [...catalog.products].sort(compareBy("rating")).slice(0, limit);
}

export function getRelatedProducts(catalog: Catalog, product: Product, limit: number): Product[] {
  const sameCategory = catalog.products.filter((p) => p.category === product.category && p.slug !== product.slug);
  const others = catalog.products.filter((p) => p.category !== product.category);
  return [...sameCategory, ...others].slice(0, limit);
}

/**
 * Whole-rupee bounds of the catalogue for the price filter, widened to
 * multiples of PRICE_FILTER_STEP. Prices are stored in paisa.
 */
export function getPriceBounds(catalog: Catalog): { min: number; max: number } {
  if (catalog.products.length === 0) return { min: 0, max: PRICE_FILTER_STEP };
  const rupees = catalog.products.map((product) => product.price / 100);
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

export function queryProducts(catalog: Catalog, query: ShopQuery, pageSize = SHOP_PAGE_SIZE): ProductPage {
  // Array.prototype.sort is stable, so "default" keeps catalogue order.
  const matches = catalog.products.filter((product) => matchesQuery(product, query)).sort(compareBy(query.sort));
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

/** Minimal product shape for cart UIs (client payload), priced again on the server at checkout. */
export function getCartCatalog(catalog: Catalog): CartProduct[] {
  return catalog.products.map(({ slug, name, price, category, unit, stock, images }) => ({
    slug,
    name,
    price,
    category,
    unit,
    stock,
    image: images[0] ?? null,
  }));
}
