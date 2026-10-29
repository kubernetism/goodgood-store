import "server-only";
import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db/client";
import { contentSlots, media } from "@/db/schema";
import { toImageAsset } from "@/features/products/catalog-assembly";
import type { ImageAsset } from "@/features/products/types";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { localImages } from "@/content/local-images";
import { SLOT_KEYS, blogCoverSlotKey } from "./slots";

export type SlotContent = { image: ImageAsset | null; youtubeId: string | null };
export type SiteContent = Record<string, SlotContent>;

/** All filled content slots, keyed by slot key. Cached until an admin edit. */
export async function getSiteContent(): Promise<SiteContent> {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.content);

  const rows = await db
    .select({
      key: contentSlots.key,
      youtubeId: contentSlots.youtubeId,
      url: media.url,
      alt: media.alt,
      width: media.width,
      height: media.height,
    })
    .from(contentSlots)
    .leftJoin(media, eq(media.id, contentSlots.mediaId));

  return Object.fromEntries(
    rows.map((row) => [
      row.key,
      {
        image: row.url && row.alt ? toImageAsset({ url: row.url, alt: row.alt, width: row.width, height: row.height }) : null,
        youtubeId: row.youtubeId,
      },
    ]),
  );
}

export function slotImage(content: SiteContent, key: string): ImageAsset | null {
  return content[key]?.image ?? localSlotImages[key] ?? null;
}

// Deliberately leave people, apiaries and video posters alone: product
// artwork should never stand in for a real team portrait or filmed harvest.
const localSlotImages: Record<string, ImageAsset> = {
  [SLOT_KEYS.homeHero]: localImages.shop,
  [SLOT_KEYS.contactMap]: localImages.shop,
  [SLOT_KEYS.aboutFaq]: localImages.honey,
  [blogCoverSlotKey("how-to-spot-adulterated-honey")]: localImages.honey,
  [blogCoverSlotKey("why-raw-honey-crystallises")]: localImages.honey,
  [blogCoverSlotKey("a-guide-to-pakistani-honey-varieties")]: localImages.wildHoney,
  [blogCoverSlotKey("how-bees-make-honeycomb")]: localImages.wildHoney,
};
