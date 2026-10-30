"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db/client";
import { contactMessages } from "@/db/schema";
import { requireAdmin } from "@/server/auth/session";

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function setMessageRead(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  if (!z.uuid().safeParse(id).success) fail("/admin/messages", "Invalid message.");
  const read = form.get("read");
  if (read !== "yes" && read !== "no") fail(`/admin/messages/${id}`, "Invalid message status.");
  let rows: { id: string }[];
  try {
    rows = await db.update(contactMessages).set({ isRead: read === "yes" }).where(eq(contactMessages.id, id)).returning({ id: contactMessages.id });
  } catch {
    fail(`/admin/messages/${id}`, "Could not update this message. Please try again.");
  }
  if (!rows.length) fail("/admin/messages", "Message not found.");
  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${id}`);
  redirect(`/admin/messages/${id}?saved=1`);
}

export async function deleteMessage(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  if (!z.uuid().safeParse(id).success) fail("/admin/messages", "Invalid message.");
  if (form.get("confirm") !== "yes") fail(`/admin/messages/${id}`, "Confirm message deletion first.");
  let rows: { id: string }[];
  try {
    rows = await db.delete(contactMessages).where(eq(contactMessages.id, id)).returning({ id: contactMessages.id });
  } catch {
    fail(`/admin/messages/${id}`, "Could not delete this message. Please try again.");
  }
  if (!rows.length) fail("/admin/messages", "Message not found.");
  revalidatePath("/admin/messages");
  redirect("/admin/messages?deleted=1");
}
