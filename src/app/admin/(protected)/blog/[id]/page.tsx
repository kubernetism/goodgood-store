import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { z } from "zod";
import { db } from "@/db/client";
import { blogPosts, media } from "@/db/schema";
import { BlogEditor } from "@/features/admin/blog-editor";
import { toImageOptions } from "@/features/admin/image-options";
import { AdminHeading, AdminNotice, StatusPill } from "@/features/admin/ui";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;
export const metadata: Metadata = { title: "Edit post" };

export default async function EditBlogPost({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [rows, images, notice] = await Promise.all([db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1), db.select({ id: media.id, alt: media.alt, url: media.url }).from(media).orderBy(desc(media.createdAt)), searchParams]);
  const post = rows[0];
  if (!post) notFound();
  return <div className="admin-page">
    <AdminHeading back={{ href: "/admin/blog", label: "Back to blog" }} eyebrow="Website" title={post.title} meta={post.isPublished ? <StatusPill tone="positive" label="Published" /> : <StatusPill tone="neutral" label="Draft" />} />
    <AdminNotice error={notice.error} saved={notice.saved} message="Post saved." />
    <BlogEditor post={post} images={toImageOptions(images)} />
  </div>;
}
