import type { Metadata } from "next";
import { asc, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { z } from "zod";
import { db } from "@/db/client";
import { categories, media, productImages, products } from "@/db/schema";
import { toImageOptions } from "@/features/admin/image-options";
import { ProductEditor } from "@/features/admin/product-editor";
import { AdminHeading, AdminNotice, StatusPill } from "@/features/admin/ui";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;
export const metadata: Metadata = { title: "Edit product" };

const statusPill = { active: { tone: "positive", label: "Shown on website" }, draft: { tone: "neutral", label: "Hidden" }, archived: { tone: "archived", label: "Archived" } } as const;

export default async function EditProduct({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string; delete?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [rows, choices, images, assigned, notice] = await Promise.all([
    db.select().from(products).where(eq(products.id, id)).limit(1),
    db.select().from(categories).orderBy(asc(categories.sortOrder)),
    db.select({ id: media.id, alt: media.alt, url: media.url }).from(media).orderBy(desc(media.createdAt)),
    db.select().from(productImages).where(eq(productImages.productId, id)).orderBy(asc(productImages.position)),
    searchParams,
  ]);
  const product = rows[0];
  if (!product) notFound();
  const pill = statusPill[product.status];
  return <div className="admin-page">
    <AdminHeading back={{ href: "/admin/products", label: "Back to products" }} eyebrow="Catalogue" title={product.name} meta={<StatusPill tone={pill.tone} label={pill.label} />} />
    <AdminNotice error={notice.error} saved={notice.saved} message="Product saved." />
    <ProductEditor product={product} categories={choices} images={toImageOptions(images)} selectedImages={assigned.map((i) => i.mediaId)} showDelete={notice.delete === "1"} />
  </div>;
}
