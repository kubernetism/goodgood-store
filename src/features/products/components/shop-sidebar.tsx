import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SidebarPanel } from "@/components/ui/sidebar-panel";
import { cx } from "@/lib/cx";
import { PRICE_FILTER_STEP, getCategoryCounts, getPriceBounds, getTopRatedProducts } from "../catalog";
import { productTags, type Catalog } from "../types";
import { shopHref, shopParams, type ShopQuery } from "../shop-query";
import { PriceFilter } from "./price-filter";
import { TopRatedList } from "./top-rated-list";

export function ShopSidebar({ query, catalog }: { query: ShopQuery; catalog: Catalog }) {
  const categoryCounts = getCategoryCounts(catalog).filter((category) => category.count > 0);
  const total = categoryCounts.reduce((sum, category) => sum + category.count, 0);

  return (
    <div className="space-y-8">
      <SidebarPanel title="Honey Varieties">
        <ul>
          {[{ slug: null, name: "All Honey", count: total }, ...categoryCounts].map((category) => {
            const isActive = query.category === category.slug;
            return (
              <li key={category.slug ?? "all"}>
                <Link
                  href={shopHref(query, { category: category.slug })}
                  aria-current={isActive ? "true" : undefined}
                  className={cx(
                    "group flex min-h-10 items-center justify-between gap-3 rounded-sm text-sm transition-colors duration-200 hover:text-primary-ink",
                    isActive ? "font-semibold text-primary-ink" : "text-strong",
                  )}
                >
                  <span>
                    {category.name} <span className="text-muted">({category.count})</span>
                  </span>
                  <ArrowRight
                    className="size-4 text-primary-ink transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </SidebarPanel>

      <SidebarPanel title="Filter By Price">
        <PriceFilter
          // Remount when the URL changes so the thumbs reflect the new query.
          key={shopHref(query)}
          bounds={getPriceBounds(catalog)}
          step={PRICE_FILTER_STEP}
          minPrice={query.minPrice}
          maxPrice={query.maxPrice}
          preserved={shopParams(query, ["min", "max"])}
        />
      </SidebarPanel>

      <SidebarPanel title="Top Rated">
        <TopRatedList products={getTopRatedProducts(catalog, 4)} />
      </SidebarPanel>

      <SidebarPanel title="Filter by Tag">
        <ul className="flex flex-wrap gap-2">
          {productTags.map((tag) => {
            const isActive = query.tag === tag;
            return (
              <li key={tag}>
                <Link
                  href={shopHref(query, { tag: isActive ? null : tag })}
                  aria-current={isActive ? "true" : undefined}
                  className={cx(
                    "inline-flex min-h-9 items-center rounded-full border px-3.5 text-meta font-medium transition-colors duration-200",
                    isActive
                      ? "border-strong bg-strong text-on-dark"
                      : "border-border bg-ivory text-strong hover:border-strong hover:bg-primary-tint",
                  )}
                >
                  {tag}
                </Link>
              </li>
            );
          })}
        </ul>
      </SidebarPanel>
    </div>
  );
}
