import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LayoutGrid, List, SearchX } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Container } from "@/components/ui/container";
import { FiltersDisclosure } from "@/components/ui/filters-disclosure";
import { Pagination } from "@/components/ui/pagination";
import { buttonClasses } from "@/components/ui/button";
import { getCategory, queryProducts } from "@/features/products/catalog";
import { ProductGrid } from "@/features/products/components/product-grid";
import { ProductListItem } from "@/features/products/components/product-list-item";
import { ShopSidebar } from "@/features/products/components/shop-sidebar";
import { SortSelect } from "@/features/products/components/sort-select";
import {
  hasActiveFilters,
  parseShopQuery,
  shopHref,
  shopParams,
  type ShopQuery,
} from "@/features/products/shop-query";
import { cx } from "@/lib/cx";
import { formatRupees } from "@/lib/format";

export const metadata: Metadata = {
  title: "Shop Raw Honey",
  description:
    "Shop raw, single-origin Pakistani honey: Sidr, Acacia, Wildflower, Black Forest, honeycomb and gift sets. Filter by variety, price in PKR and tag.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage({ searchParams }: PageProps<"/shop">) {
  return (
    <>
      <PageHero title="Shop Honey" eyebrow="Raw, traceable, in season" crumbs={[{ label: "Shop" }]} />
      <Container className="py-16 lg:py-24">
        {/* searchParams are request data: everything that depends on them
            streams in behind this boundary while the hero is prerendered. */}
        <Suspense fallback={<ShopSkeleton />}>
          <ShopContent searchParams={searchParams} />
        </Suspense>
      </Container>
    </>
  );
}

async function ShopContent({ searchParams }: Pick<PageProps<"/shop">, "searchParams">) {
  const query = parseShopQuery(await searchParams);
  const result = queryProducts(query);

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-6">
      <aside aria-label="Shop filters" className="lg:col-span-4 xl:pr-4">
        <FiltersDisclosure label="Filters">
          <ShopSidebar query={query} />
        </FiltersDisclosure>
      </aside>

      <section aria-labelledby="shop-results-heading" className="lg:col-span-8">
        <h2 id="shop-results-heading" className="sr-only">
          Products
        </h2>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1">
            <ViewLink query={query} view="grid" />
            <ViewLink query={query} view="list" />
          </div>
          <SortSelect value={query.sort} preserved={shopParams(query, ["sort"])} />
          <p aria-live="polite" className="w-full font-display text-sm font-semibold text-strong sm:w-auto sm:text-base">
            {result.total === 0
              ? "No results"
              : `Showing ${result.start}–${result.end} of ${result.total} results`}
          </p>
        </div>

        {hasActiveFilters(query) && <ActiveFilters query={query} />}

        <div className="mt-8">
          {result.items.length === 0 ? (
            <EmptyResults />
          ) : query.view === "list" ? (
            <ul className="space-y-6">
              {result.items.map((product) => (
                <li key={product.slug}>
                  <ProductListItem product={product} />
                </li>
              ))}
            </ul>
          ) : (
            <ProductGrid products={result.items} columns={3} />
          )}
        </div>

        <Pagination
          className="mt-12"
          label="Product pages"
          page={result.page}
          pageCount={result.pageCount}
          hrefFor={(page) => shopHref(query, { page })}
        />
      </section>
    </div>
  );
}

function ViewLink({ query, view }: { query: ShopQuery; view: ShopQuery["view"] }) {
  const isActive = query.view === view;
  const Icon = view === "grid" ? LayoutGrid : List;
  return (
    <Link
      href={shopHref(query, { view, page: query.page })}
      aria-current={isActive ? "true" : undefined}
      className={cx(
        "flex size-11 items-center justify-center rounded-full transition-colors duration-200",
        isActive ? "bg-strong text-on-dark" : "text-strong hover:bg-primary-tint",
      )}
    >
      <Icon className="size-5" strokeWidth={isActive ? 2.25 : 1.75} aria-hidden="true" />
      <span className="sr-only">{view === "grid" ? "Grid view" : "List view"}</span>
    </Link>
  );
}

function ActiveFilters({ query }: { query: ShopQuery }) {
  const labels = [
    query.q && `“${query.q}”`,
    query.category && getCategory(query.category).name,
    query.tag,
    (query.minPrice !== null || query.maxPrice !== null) &&
      `${formatRupees(query.minPrice ?? 0)} – ${query.maxPrice !== null ? formatRupees(query.maxPrice) : "any"}`,
  ].filter(Boolean);

  return (
    <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-meta">
      <span className="text-strong">Filtered by: {labels.join(" · ")}</span>
      <Link
        href={shopHref({ ...query, category: null, tag: null, q: "", minPrice: null, maxPrice: null })}
        className="font-semibold text-primary-ink underline underline-offset-2 hover:no-underline"
      >
        Clear all filters
      </Link>
    </p>
  );
}

function EmptyResults() {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed border-border-strong/50 bg-ivory px-6 py-16 text-center">
      <SearchX className="size-10 text-primary-ink" strokeWidth={1.5} aria-hidden="true" />
      <h3 className="mt-4 font-heading text-promo font-semibold">No honey matches those filters</h3>
      <p className="mt-2 max-w-sm">Try another variety or widen the price range.</p>
      <Link href="/shop" className={buttonClasses({ className: "mt-6" })}>
        View all honey
      </Link>
    </div>
  );
}

function ShopSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading products" className="grid gap-10 lg:grid-cols-12 lg:gap-6">
      <div className="hidden space-y-8 lg:col-span-4 lg:block">
        {[0, 1, 2].map((key) => (
          <div key={key} className="h-56 animate-pulse rounded-md bg-tile" />
        ))}
      </div>
      <div className="lg:col-span-8">
        <div className="h-10 animate-pulse rounded-md bg-tile" />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3">
          {Array.from({ length: 6 }, (_, key) => (
            <div key={key} className="aspect-[3/4] animate-pulse rounded-md bg-tile" />
          ))}
        </div>
      </div>
    </div>
  );
}
