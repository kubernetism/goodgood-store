import type { Metadata } from "next";
import { asc, desc } from "drizzle-orm";
import { connection } from "next/server";
import { db } from "@/db/client";
import { categories, media } from "@/db/schema";
import { toImageOptions } from "@/features/admin/image-options";
import { ProductEditor } from "@/features/admin/product-editor";
import { AdminHeading, AdminNotice } from "@/features/admin/ui";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;
export const metadata: Metadata = { title: "Add product" };

export default async function NewProduct({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  await connection();
  await requireAdmin();
  const [choices, images, notice] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.sortOrder)),
    db.select({ id: media.id, alt: media.alt, url: media.url }).from(media).orderBy(desc(media.createdAt)),
    searchParams,
  ]);
  return <div className="admin-page">
    <AdminHeading back={{ href: "/admin/products", label: "Back to products" }} eyebrow="Catalogue" title="Add product" description="Create a product for your catalogue." />
    <AdminNotice {...notice} />
    <ProductEditor categories={choices} images={toImageOptions(images)} selectedImages={[]} />
  </div>;
}
