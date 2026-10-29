import { asc, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { z } from "zod";
import { db } from "@/db/client";
import { categories, media, productImages, products } from "@/db/schema";
import { ProductEditor } from "@/features/admin/product-editor";
import { AdminHeading, AdminNotice } from "@/features/admin/ui";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;

export default async function EditProduct({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireAdmin(); const { id } = await params; if (!z.uuid().safeParse(id).success) notFound();
  const [rows, choices, images, assigned, notice] = await Promise.all([db.select().from(products).where(eq(products.id, id)).limit(1), db.select().from(categories).orderBy(asc(categories.sortOrder)), db.select().from(media).orderBy(desc(media.createdAt)), db.select().from(productImages).where(eq(productImages.productId, id)).orderBy(asc(productImages.position)), searchParams]);
  const product = rows[0]; if (!product) notFound();
  return <><AdminHeading title={product.name} description="Edit product details and gallery." /><AdminNotice {...notice} /><div style={{ marginTop: 16 }}><ProductEditor product={product} categories={choices} images={images} selectedImages={assigned.map((i) => i.mediaId)} /></div></>;
}
