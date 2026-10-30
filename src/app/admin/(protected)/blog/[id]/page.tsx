import { desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { z } from "zod";
import { db } from "@/db/client";
import { blogPosts, media } from "@/db/schema";
import { BlogEditor } from "@/features/admin/blog-editor";
import { AdminHeading, AdminNotice } from "@/features/admin/ui";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;

export default async function EditBlogPost({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [rows, images, notice] = await Promise.all([db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1), db.select().from(media).orderBy(desc(media.createdAt)), searchParams]);
  if (!rows[0]) notFound();
  return <><AdminHeading title={rows[0].title} description="Edit your post and its publication status." /><AdminNotice {...notice} /><div style={{ marginTop: 16 }}><BlogEditor post={rows[0]} images={images} /></div></>;
}
