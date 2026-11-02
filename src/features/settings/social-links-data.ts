import "server-only";
import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db/client";
import { storeSettings } from "@/db/schema";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { siteConfig } from "@/lib/site";
import { isUndefinedColumn, isUndefinedTable } from "@/server/db-errors";
import { resolveSiteSocialLinks, type SiteSocialLink } from "./site-socials";

/**
 * The site's social links (header, footer, blog), from Admin > Settings.
 * Cached until Settings are saved (the store-settings tag).
 */
export async function getSiteSocialLinks(): Promise<SiteSocialLink[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.settings);
  return resolveSiteSocialLinks(await loadStoredSocialLinks(), siteConfig.socials);
}

/** Raw stored value; null when never saved or before the social_links migration is applied. */
async function loadStoredSocialLinks(): Promise<unknown> {
  try {
    const [row] = await db.select({ socialLinks: storeSettings.socialLinks }).from(storeSettings).where(eq(storeSettings.id, 1)).limit(1);
    return row?.socialLinks ?? null;
  } catch (error) {
    if (isUndefinedColumn(error) || isUndefinedTable(error)) return null;
    throw error;
  }
}
