"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { storeSettings } from "@/db/schema";
import { parseSocialLinksForm } from "@/features/settings/site-socials";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { requireAdmin } from "@/server/auth/session";

/** Saves every site social link at once; the header, footer and blog read them via the store-settings tag. */
export async function saveSocialLinks(form: FormData) {
  await requireAdmin();
  const parsed = parseSocialLinksForm(form);
  if (!parsed.ok) redirect(`/admin/settings?error=${encodeURIComponent(parsed.error)}`);
  try {
    await db.insert(storeSettings).values({ id: 1, socialLinks: parsed.links }).onConflictDoUpdate({
      target: storeSettings.id,
      set: { socialLinks: parsed.links },
    });
  } catch (cause) {
    console.error("Social links save failed", cause);
    redirect(`/admin/settings?error=${encodeURIComponent("Could not save the social links. Please try again.")}`);
  }
  updateTag(CACHE_TAGS.settings);
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=social");
}
