import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db/client";
import { categories, media, productImages, products } from "@/db/schema";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { assembleCatalog, type MediaRow } from "./catalog-assembly";
import type { Catalog } from "./types";
import { localImages } from "@/content/local-images";
import { withLocalCatalogImages } from "./local-catalog-images";

const mediaColumns = { url: media.url, alt: media.alt, width: media.width, height: media.height };

/**
 * The storefront catalogue: active products in active categories, with their
 * images. Cached until an admin edit or an order invalidates the `catalog` tag,
 * so shop, product and home pages prerender into the static shell.
 */
export async function getCatalog(): Promise<Catalog> {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.catalog);

  const [categoryRows, productRows, imageRows] = await Promise.all([
    db
      .select({
        id: categories.id,
        slug: categories.slug,
        name: categories.name,
        blurb: categories.blurb,
        highlights: categories.highlights,
        image: mediaColumns,
      })
      .from(categories)
      .leftJoin(media, eq(media.id, categories.imageId))
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.sortOrder), asc(categories.name)),
    db
      .select({
        id: products.id,
        slug: products.slug,
        name: products.name,
        categoryId: products.categoryId,
        price: products.price,
        compareAtPrice: products.compareAtPrice,
        stock: products.stock,
        rating: products.rating,
        reviewCount: products.reviewCount,
        unit: products.unit,
        origin: products.origin,
        harvest: products.harvest,
        floralSource: products.floralSource,
        tasteNotes: products.tasteNotes,
        summary: products.summary,
        description: products.description,
        tags: products.tags,
        listedOn: products.listedOn,
      })
      .from(products)
      .where(eq(products.status, "active"))
      .orderBy(asc(products.sortOrder), asc(products.name)),
    db
      .select({ productId: productImages.productId, position: productImages.position, media: mediaColumns })
      .from(productImages)
      .innerJoin(media, eq(media.id, productImages.mediaId))
      .innerJoin(products, and(eq(products.id, productImages.productId), eq(products.status, "active"))),
  ]);

  return withLocalCatalogImages(assembleCatalog(
    categoryRows.map((row) => ({ ...row, image: nonEmptyMedia(row.image) })),
    productRows,
    imageRows,
  ), localImages);
}

/** A left join yields an object of nulls when there is no image. */
function nonEmptyMedia(row: { url: string | null; alt: string | null; width: number | null; height: number | null } | null): MediaRow | null {
  return row?.url && row.alt ? { url: row.url, alt: row.alt, width: row.width, height: row.height } : null;
}
