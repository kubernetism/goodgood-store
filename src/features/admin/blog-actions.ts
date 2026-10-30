"use server";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db/client";
import { blogPosts } from "@/db/schema";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { requireAdmin } from "@/server/auth/session";
import { blogFormSchema } from "./blog-schema";

const value = (form: FormData, name: string) => String(form.get(name) ?? "");
function error(path: string, message: string): never { redirect(`${path}?error=${encodeURIComponent(message)}`); }

function refreshBlog() {
  updateTag(CACHE_TAGS.blog);
  revalidatePath("/admin/blog");
  revalidatePath("/sitemap.xml");
}

export async function saveBlogPost(form: FormData) {
  await requireAdmin();
  const id = value(form, "id");
  if (id && !z.uuid().safeParse(id).success) error("/admin/blog", "Invalid post.");
  const path = id ? `/admin/blog/${id}` : "/admin/blog/new";
  const parsed = blogFormSchema.safeParse({ ...Object.fromEntries(form.entries()), isPublished: value(form, "isPublished") === "yes" });
  if (!parsed.success) error(path, parsed.error.issues[0]?.message ?? "Check the post details.");
  const postId = id || randomUUID();
  let rows: { id: string }[];
  try {
    rows = id
      ? await db.update(blogPosts).set(parsed.data).where(eq(blogPosts.id, id)).returning({ id: blogPosts.id })
      : await db.insert(blogPosts).values({ id: postId, ...parsed.data }).returning({ id: blogPosts.id });
  } catch (cause) {
    console.error("Blog save failed", cause);
    error(path, "Could not save the post. Check that the slug is unique and the selected image exists.");
  }
  if (!rows.length) error("/admin/blog", "Post not found.");
  refreshBlog();
  redirect(`/admin/blog/${postId}?saved=1`);
}

export async function deleteBlogPost(form: FormData) {
  await requireAdmin();
  const id = value(form, "id");
  if (!z.uuid().safeParse(id).success) error("/admin/blog", "Invalid post.");
  const path = `/admin/blog/${id}`;
  if (value(form, "confirm") !== "yes") error(path, "Confirm post deletion first.");
  let rows: { id: string }[];
  try {
    rows = await db.delete(blogPosts).where(eq(blogPosts.id, id)).returning({ id: blogPosts.id });
  } catch (cause) {
    console.error("Blog deletion failed", cause);
    error(path, "Could not delete the post. Please try again.");
  }
  if (!rows.length) error("/admin/blog", "Post not found.");
  refreshBlog();
  redirect("/admin/blog?saved=1");
}
