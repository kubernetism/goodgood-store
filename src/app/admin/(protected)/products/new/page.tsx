import { asc, desc } from "drizzle-orm";
import { db } from "@/db/client";
import { categories, media } from "@/db/schema";
import { ProductEditor } from "@/features/admin/product-editor";
import { AdminHeading, AdminNotice } from "@/features/admin/ui";
import { requireAdmin } from "@/server/auth/session";
import { connection } from "next/server";

export const instant = false;

export default async function NewProduct({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  await connection(); await requireAdmin(); const [choices, images, notice] = await Promise.all([db.select().from(categories).orderBy(asc(categories.sortOrder)), db.select().from(media).orderBy(desc(media.createdAt)), searchParams]);
  return <><AdminHeading title="Add product" description="Create a product for your catalogue." /><AdminNotice {...notice} /><div style={{ marginTop: 16 }}><ProductEditor categories={choices} images={images} selectedImages={[]} /></div></>;
}
