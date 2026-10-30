"use server";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db/client";
import { testimonials } from "@/db/schema";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { requireAdmin } from "@/server/auth/session";
import { testimonialFormSchema } from "./testimonial-schema";

const value = (form: FormData, name: string) => String(form.get(name) ?? "");
function error(path: string, message: string): never { redirect(`${path}?error=${encodeURIComponent(message)}`); }
function refresh() { updateTag(CACHE_TAGS.testimonials); revalidatePath("/admin/testimonials"); }

export async function saveTestimonial(form: FormData) {
  await requireAdmin();
  const id = value(form, "id");
  if (id && !z.uuid().safeParse(id).success) error("/admin/testimonials", "Invalid testimonial.");
  const path = id ? `/admin/testimonials/${id}` : "/admin/testimonials/new";
  const parsed = testimonialFormSchema.safeParse({ ...Object.fromEntries(form.entries()), isActive: value(form, "isActive") === "yes" });
  if (!parsed.success) error(path, parsed.error.issues[0]?.message ?? "Check the testimonial details.");
  const testimonialId = id || randomUUID();
  let rows: { id: string }[];
  try {
    rows = id
      ? await db.update(testimonials).set(parsed.data).where(eq(testimonials.id, id)).returning({ id: testimonials.id })
      : await db.insert(testimonials).values({ id: testimonialId, ...parsed.data }).returning({ id: testimonials.id });
  } catch (cause) {
    console.error("Testimonial save failed", cause);
    error(path, "Could not save the testimonial. Please try again.");
  }
  if (!rows.length) error("/admin/testimonials", "Testimonial not found.");
  refresh();
  redirect(`/admin/testimonials/${testimonialId}?saved=1`);
}

export async function deleteTestimonial(form: FormData) {
  await requireAdmin();
  const id = value(form, "id");
  if (!z.uuid().safeParse(id).success) error("/admin/testimonials", "Invalid testimonial.");
  const path = `/admin/testimonials/${id}`;
  if (value(form, "confirm") !== "yes") error(path, "Confirm testimonial deletion first.");
  let rows: { id: string }[];
  try { rows = await db.delete(testimonials).where(eq(testimonials.id, id)).returning({ id: testimonials.id }); }
  catch (cause) { console.error("Testimonial deletion failed", cause); error(path, "Could not delete the testimonial. Please try again."); }
  if (!rows.length) error("/admin/testimonials", "Testimonial not found.");
  refresh();
  redirect("/admin/testimonials?saved=1");
}
