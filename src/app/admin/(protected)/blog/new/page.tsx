import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { db } from "@/db/client";
import { media } from "@/db/schema";
import { BlogEditor } from "@/features/admin/blog-editor";
import { toImageOptions } from "@/features/admin/image-options";
import { AdminHeading, AdminNotice } from "@/features/admin/ui";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;
export const metadata: Metadata = { title: "Add post" };

export default async function NewBlogPost({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireAdmin();
  const [images, notice] = await Promise.all([db.select({ id: media.id, alt: media.alt, url: media.url }).from(media).orderBy(desc(media.createdAt)), searchParams]);
  return <div className="admin-page">
    <AdminHeading back={{ href: "/admin/blog", label: "Back to blog" }} eyebrow="Website" title="Add post" description="Create a post for the Honey Journal." />
    <AdminNotice {...notice} />
    <BlogEditor images={toImageOptions(images)} />
  </div>;
}
