import "server-only";
import { asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db/client";
import { banners, media, products } from "@/db/schema";
import { toImageAsset } from "@/features/products/catalog-assembly";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { pickActiveBanners, type ActiveBanners } from "./model";

/**
 * The live banner for each placement. Start/end dates are evaluated when the
 * cache entry is built, so with the `hours` profile a scheduled banner goes
 * live or ends within about an hour of its time (the deal countdown itself
 * flips to "Deal ended" on the client at the exact second). Admin edits
 * invalidate the `banners` tag immediately.
 */
export async function getActiveBanners(): Promise<ActiveBanners> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.banners);

  const rows = await db
    .select({
      id: banners.id,
      placement: banners.placement,
      title: banners.title,
      subtitle: banners.subtitle,
      ctaLabel: banners.ctaLabel,
      ctaHref: banners.ctaHref,
      isActive: banners.isActive,
      startsAt: banners.startsAt,
      endsAt: banners.endsAt,
      sortOrder: banners.sortOrder,
      productSlug: products.slug,
      imageUrl: media.url,
      imageAlt: media.alt,
      imageWidth: media.width,
      imageHeight: media.height,
    })
    .from(banners)
    .leftJoin(media, eq(media.id, banners.imageId))
    .leftJoin(products, eq(products.id, banners.productId))
    .where(eq(banners.isActive, true))
    .orderBy(asc(banners.sortOrder));

  return pickActiveBanners(
    rows.map((row) => ({
      id: row.id,
      placement: row.placement,
      title: row.title,
      subtitle: row.subtitle,
      ctaLabel: row.ctaLabel,
      ctaHref: row.ctaHref,
      isActive: row.isActive,
      startsAt: row.startsAt?.toISOString() ?? null,
      endsAt: row.endsAt?.toISOString() ?? null,
      sortOrder: row.sortOrder,
      productSlug: row.productSlug,
      image:
        row.imageUrl && row.imageAlt
          ? toImageAsset({ url: row.imageUrl, alt: row.imageAlt, width: row.imageWidth, height: row.imageHeight })
          : null,
    })),
    new Date(),
  );
}
