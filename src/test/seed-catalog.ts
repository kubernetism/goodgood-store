import { categories, categoryHighlights, products } from "@/db/seed/catalog-seed";
import { assembleCatalog } from "@/features/products/catalog-assembly";
import type { Catalog } from "@/features/products/types";

/**
 * The seed catalogue in its database-loaded shape, built through the same
 * assembler the storefront uses. Test fixture only.
 */
export function seedCatalog({ stock = 25 }: { stock?: number } = {}): Catalog {
  return assembleCatalog(
    categories.map((category) => ({
      id: `cat-${category.slug}`,
      slug: category.slug,
      name: category.name,
      blurb: category.blurb,
      highlights: categoryHighlights[category.slug],
      image: null,
    })),
    products.map((product) => ({
      id: `prod-${product.slug}`,
      slug: product.slug,
      name: product.name,
      categoryId: `cat-${product.category}`,
      price: product.price,
      compareAtPrice: product.compareAtPrice ?? null,
      stock,
      rating: product.rating,
      reviewCount: product.reviewCount,
      unit: product.unit,
      origin: product.origin,
      harvest: product.harvest,
      floralSource: product.floralSource,
      tasteNotes: product.tasteNotes,
      summary: product.summary,
      description: product.description,
      tags: product.tags,
      listedOn: product.listedOn,
    })),
    [],
  );
}
