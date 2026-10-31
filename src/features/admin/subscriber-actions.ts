"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db/client";
import { newsletterSubscribers } from "@/db/schema";
import { requireAdmin } from "@/server/auth/session";

function fail(message: string): never {
  redirect(`/admin/subscribers?error=${encodeURIComponent(message)}`);
}

/** Permanently removes one subscriber (unsubscribe or erasure requests). */
export async function deleteSubscriber(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  if (!z.uuid().safeParse(id).success) fail("Invalid subscriber.");
  if (form.get("confirm") !== "yes") fail("Confirm the removal first.");
  let rows: { id: string }[];
  try {
    rows = await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.id, id)).returning({ id: newsletterSubscribers.id });
  } catch (cause) {
    console.error("Subscriber deletion failed", cause);
    fail("Could not remove this subscriber. Please try again.");
  }
  if (!rows.length) fail("Subscriber not found. They may already have been removed.");
  revalidatePath("/admin/subscribers");
  revalidatePath("/admin");
  redirect("/admin/subscribers?deleted=1");
}
