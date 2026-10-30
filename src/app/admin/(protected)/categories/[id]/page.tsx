import { count, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { z } from "zod";
import { db } from "@/db/client";
import { categories, media, products } from "@/db/schema";
import { CategoryEditor } from "@/features/admin/category-editor";
import { AdminHeading, AdminNotice } from "@/features/admin/ui";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;

export default async function EditCategory({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [rows, images, counts, notice] = await Promise.all([
    db.select().from(categories).where(eq(categories.id, id)).limit(1),
    db.select().from(media).orderBy(desc(media.createdAt)),
    db.select({ count: count() }).from(products).where(eq(products.categoryId, id)),
    searchParams,
  ]);
  const category = rows[0];
  if (!category) notFound();
  return <><AdminHeading title={category.name} description="Edit category details and visibility." /><AdminNotice {...notice} /><div style={{ marginTop: 16 }}><CategoryEditor category={category} images={images} productCount={counts[0]?.count ?? 0} /></div></>;
}
