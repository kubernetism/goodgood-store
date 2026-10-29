import { productTags, type ProductTag } from "./types";

export const sortOptions = [
  { value: "default", label: "Default sorting" },
  { value: "popularity", label: "Sort by popularity" },
  { value: "rating", label: "Sort by average rating" },
  { value: "newest", label: "Sort by latest" },
  { value: "price-asc", label: "Sort by price: low to high" },
  { value: "price-desc", label: "Sort by price: high to low" },
] as const;

export type SortKey = (typeof sortOptions)[number]["value"];
export type ShopView = "grid" | "list";

/** Parsed, trusted shape of the /shop URL. Built only via `parseShopQuery`. */
export type ShopQuery = {
  /** A known category slug. */
  category: string | null;
  tag: ProductTag | null;
  q: string;
  /** Whole rupees, inclusive. */
  minPrice: number | null;
  maxPrice: number | null;
  sort: SortKey;
  view: ShopView;
  page: number;
};

export const defaultShopQuery: ShopQuery = {
  category: null,
  tag: null,
  q: "",
  minPrice: null,
  maxPrice: null,
  sort: "default",
  view: "grid",
  page: 1,
};

type RawSearchParams = Record<string, string | string[] | undefined>;

const MAX_QUERY_LENGTH = 80;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function oneOf<T extends string>(value: string | undefined, allowed: ReadonlyArray<T>): T | null {
  return value !== undefined && (allowed as ReadonlyArray<string>).includes(value) ? (value as T) : null;
}

function nonNegativeInt(value: string | undefined): number | null {
  if (value === undefined || !/^\d{1,6}$/.test(value)) return null;
  return Number(value);
}

/**
 * Parses untrusted search params into a ShopQuery. Unknown or malformed values
 * fall back to defaults instead of erroring, so hand-edited URLs still work.
 * `categorySlugs` are the live categories (they are editable in the admin).
 */
export function parseShopQuery(raw: RawSearchParams, categorySlugs: ReadonlyArray<string>): ShopQuery {
  const category = oneOf(first(raw.category), categorySlugs);
  const tag = oneOf(first(raw.tag), productTags);
  const q = (first(raw.q) ?? "").trim().slice(0, MAX_QUERY_LENGTH);
  const sort = oneOf(first(raw.sort), sortOptions.map((o) => o.value)) ?? "default";
  const view: ShopView = first(raw.view) === "list" ? "list" : "grid";
  const page = Math.max(1, nonNegativeInt(first(raw.page)) ?? 1);

  let minPrice = nonNegativeInt(first(raw.min));
  let maxPrice = nonNegativeInt(first(raw.max));
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    [minPrice, maxPrice] = [maxPrice, minPrice];
  }

  return { category, tag, q, minPrice, maxPrice, sort, view, page };
}

/**
 * Builds a /shop URL from a query plus overrides, omitting defaults so URLs stay
 * short. Any filter change resets pagination unless `page` is overridden.
 */
export function shopHref(query: ShopQuery, overrides: Partial<ShopQuery> = {}): string {
  const next: ShopQuery = { ...query, page: 1, ...overrides };
  const params = new URLSearchParams();

  if (next.category) params.set("category", next.category);
  if (next.tag) params.set("tag", next.tag);
  if (next.q) params.set("q", next.q);
  if (next.minPrice !== null) params.set("min", String(next.minPrice));
  if (next.maxPrice !== null) params.set("max", String(next.maxPrice));
  if (next.sort !== "default") params.set("sort", next.sort);
  if (next.view !== "grid") params.set("view", next.view);
  if (next.page > 1) params.set("page", String(next.page));

  const search = params.toString();
  return search ? `/shop?${search}` : "/shop";
}

export function hasActiveFilters(query: ShopQuery): boolean {
  return (
    query.category !== null ||
    query.tag !== null ||
    query.q !== "" ||
    query.minPrice !== null ||
    query.maxPrice !== null
  );
}

type ShopParamName = "category" | "tag" | "q" | "min" | "max" | "sort" | "view";

/**
 * The query as plain URL params (defaults and page omitted), minus `omit`.
 * Used for hidden inputs so GET forms keep the other active filters.
 */
export function shopParams(query: ShopQuery, omit: ReadonlyArray<ShopParamName> = []): Record<string, string> {
  const params = new URLSearchParams(shopHref(query).split("?")[1] ?? "");
  for (const name of omit) params.delete(name);
  return Object.fromEntries(params);
}
