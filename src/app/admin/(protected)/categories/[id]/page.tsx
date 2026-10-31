import type { Metadata } from "next";
import { count, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { z } from "zod";
import { db } from "@/db/client";
import { categories, media, products } from "@/db/schema";
import { CategoryEditor } from "@/features/admin/category-editor";
import { toImageOptions } from "@/features/admin/image-options";
import { AdminHeading, AdminNotice, StatusPill } from "@/features/admin/ui";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;
export const metadata: Metadata = { title: "Edit category" };

export default async function EditCategory({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [rows, images, counts, notice] = await Promise.all([
    db.select().from(categories).where(eq(categories.id, id)).limit(1),
    db.select({ id: media.id, alt: media.alt, url: media.url }).from(media).orderBy(desc(media.createdAt)),
    db.select({ count: count() }).from(products).where(eq(products.categoryId, id)),
    searchParams,
  ]);
  const category = rows[0];
  if (!category) notFound();
  return <div className="admin-page">
    <AdminHeading back={{ href: "/admin/categories", label: "Back to categories" }} eyebrow="Catalogue" title={category.name} meta={category.isActive ? <StatusPill tone="positive" label="Shown" /> : <StatusPill tone="neutral" label="Hidden" />} />
    <AdminNotice error={notice.error} saved={notice.saved} message="Category saved." />
    <CategoryEditor category={category} images={toImageOptions(images)} productCount={counts[0]?.count ?? 0} />
  </div>;
}
