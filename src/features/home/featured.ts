import { getTopRatedProducts } from "@/features/products/catalog";
import type { Catalog, Product } from "@/features/products/types";

/**
 * The landing page's shelf: products the shop can sell right now first, then
 * those the admin tagged "Best Seller", each group in top-rated order. Sold-out
 * jars only fill the shelf when nothing else is left to show.
 */
export function pickFeaturedProducts(catalog: Catalog, limit: number): Product[] {
  const rank = (product: Product) => (product.stock > 0 ? 0 : 2) + (product.tags.includes("Best Seller") ? 0 : 1);
  // Array.prototype.sort is stable, so ties keep the top-rated order.
  return getTopRatedProducts(catalog, catalog.products.length)
    .sort((a, b) => rank(a) - rank(b))
    .slice(0, limit);
}

/**
 * The jar on the hero label: a linked hero banner's product, else an in-stock
 * "Best Seller", else the top-rated in-stock jar of the first category in the
 * admin's order (so the label leads with the shop's headline variety, not
 * whichever side line happens to rate highest).
 */
export function pickHeroProduct(catalog: Catalog, productSlug: string | null | undefined): Product | null {
  const inStock = getTopRatedProducts(catalog, catalog.products.length).filter((product) => product.stock > 0);
  const linked = productSlug ? inStock.find((product) => product.slug === productSlug) : undefined;
  if (linked) return linked;
  const bestSeller = inStock.find((product) => product.tags.includes("Best Seller"));
  if (bestSeller) return bestSeller;
  for (const category of catalog.categories) {
    const pick = inStock.find((product) => product.category === category.slug);
    if (pick) return pick;
  }
  return inStock[0] ?? null;
}
