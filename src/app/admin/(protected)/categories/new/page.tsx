import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { db } from "@/db/client";
import { media } from "@/db/schema";
import { CategoryEditor } from "@/features/admin/category-editor";
import { toImageOptions } from "@/features/admin/image-options";
import { AdminHeading, AdminNotice } from "@/features/admin/ui";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;
export const metadata: Metadata = { title: "Add category" };

export default async function NewCategory({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireAdmin();
  const [images, notice] = await Promise.all([db.select({ id: media.id, alt: media.alt, url: media.url }).from(media).orderBy(desc(media.createdAt)), searchParams]);
  return <div className="admin-page">
    <AdminHeading back={{ href: "/admin/categories", label: "Back to categories" }} eyebrow="Catalogue" title="Add category" description="Create a category for your products." />
    <AdminNotice {...notice} />
    <CategoryEditor images={toImageOptions(images)} />
  </div>;
}
