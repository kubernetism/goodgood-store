"use server";

import { db } from "@/db/client";
import { storeSettings } from "@/db/schema";
import { requireAdmin } from "@/server/auth/session";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { normalizeWhatsappNumber } from "./whatsapp-settings";
import { CACHE_TAGS } from "@/lib/cache-tags";

export async function saveWhatsappSettings(form: FormData) {
  await requireAdmin();
  const input = String(form.get("orderWhatsappNumber") ?? "").trim();
  const number = input ? normalizeWhatsappNumber(input) : null;
  if (input && !number) redirect("/admin/settings?error=" + encodeURIComponent("Enter a valid WhatsApp number with its country code, or a Pakistani mobile number."));
  await db.insert(storeSettings).values({ id: 1, orderWhatsappNumber: number }).onConflictDoUpdate({
    target: storeSettings.id,
    set: { orderWhatsappNumber: number },
  });
  updateTag(CACHE_TAGS.settings);
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=1");
}
