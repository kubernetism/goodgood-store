import { desc } from "drizzle-orm";
import { db } from "@/db/client";
import { media } from "@/db/schema";
import { CategoryEditor } from "@/features/admin/category-editor";
import { AdminHeading, AdminNotice } from "@/features/admin/ui";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;

export default async function NewCategory({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireAdmin();
  const [images, notice] = await Promise.all([db.select().from(media).orderBy(desc(media.createdAt)), searchParams]);
  return <><AdminHeading title="Add category" description="Create a category for your products." /><AdminNotice {...notice} /><div style={{ marginTop: 16 }}><CategoryEditor images={images} /></div></>;
}
