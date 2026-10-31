import "server-only";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { banners, blogPosts, categories, contentSlots, productImages, products } from "@/db/schema";
import { getSlotDefinition } from "@/features/content/slots";
import { emptyMediaUsage, type MediaUsage } from "./media-usage";

/** Where each of the given media items is referenced (one query per referencing table, run in parallel). */
export async function loadMediaUsage(mediaIds: string[]): Promise<Map<string, MediaUsage>> {
  const usage = new Map(mediaIds.map((id) => [id, emptyMediaUsage()]));
  if (!mediaIds.length) return usage;
  const [productRows, categoryRows, bannerRows, blogRows, slotRows] = await Promise.all([
    db.select({ mediaId: productImages.mediaId, name: products.name }).from(productImages).innerJoin(products, eq(products.id, productImages.productId)).where(inArray(productImages.mediaId, mediaIds)).orderBy(products.name),
    db.select({ mediaId: categories.imageId, name: categories.name }).from(categories).where(inArray(categories.imageId, mediaIds)).orderBy(categories.name),
    db.select({ mediaId: banners.imageId, name: banners.title }).from(banners).where(inArray(banners.imageId, mediaIds)).orderBy(banners.title),
    db.select({ mediaId: blogPosts.coverId, name: blogPosts.title }).from(blogPosts).where(inArray(blogPosts.coverId, mediaIds)).orderBy(blogPosts.title),
    db.select({ mediaId: contentSlots.mediaId, key: contentSlots.key }).from(contentSlots).where(inArray(contentSlots.mediaId, mediaIds)).orderBy(contentSlots.key),
  ]);
  const add = (key: keyof MediaUsage, mediaId: string | null, name: string) => {
    const entry = mediaId ? usage.get(mediaId) : undefined;
    if (entry && !entry[key].includes(name)) entry[key].push(name);
  };
  for (const row of productRows) add("products", row.mediaId, row.name);
  for (const row of categoryRows) add("categories", row.mediaId, row.name);
  for (const row of bannerRows) add("banners", row.mediaId, row.name);
  for (const row of blogRows) add("blogPosts", row.mediaId, row.name);
  for (const row of slotRows) {
    const slot = getSlotDefinition(row.key);
    add("contentSlots", row.mediaId, slot ? `${slot.group}: ${slot.label}` : row.key);
  }
  return usage;
}
