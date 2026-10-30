import type { Metadata } from "next";
import { getCategory, queryProducts } from "./catalog";
import { parseShopQuery, shopHref, defaultShopQuery } from "./shop-query";
import type { Catalog } from "./types";

export function shopMetadata(raw: Record<string, string | string[] | undefined>, catalog: Catalog): Metadata {
  const query = parseShopQuery(raw, catalog.categories.map((category) => category.slug));
  const category = query.category ? getCategory(catalog, query.category) : undefined;
  const result = queryProducts(catalog, query);
  const isSearch = Boolean(query.q || query.tag || query.minPrice !== null || query.maxPrice !== null || query.sort !== "default");
  const invalidCategory = Boolean(raw.category && !category);
  const indexable = !isSearch && !invalidCategory && (!category || result.total > 0);
  const title = category ? `Shop ${category.name} | Honey in Pakistan` : "Shop Honey in Pakistan";
  const description = category?.blurb || "Explore honey, honeycomb and gifts from Abdul Sami Honey Enterprises. Order online across Pakistan.";
  const canonical = shopHref(defaultShopQuery, { category: query.category, page: result.page });

  return {
    title,
    description,
    robots: { index: indexable, follow: true },
    ...(indexable ? { alternates: { canonical } } : {}),
  };
}
