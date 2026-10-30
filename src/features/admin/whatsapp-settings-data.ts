import "server-only";
import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db/client";
import { storeSettings } from "@/db/schema";
import { CACHE_TAGS } from "@/lib/cache-tags";

export async function getOrderWhatsappNumber(): Promise<string | null> {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.settings);
  const [row] = await db.select({ number: storeSettings.orderWhatsappNumber }).from(storeSettings).where(eq(storeSettings.id, 1)).limit(1);
  return row?.number ?? null;
}
