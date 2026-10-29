import { asc, desc } from "drizzle-orm";
import { db } from "@/db/client";
import { media, products } from "@/db/schema";
import { BannerEditor } from "@/features/admin/banner-editor";
import { AdminHeading, AdminNotice } from "@/features/admin/ui";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;

export default async function NewBanner({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireAdmin(); const [images, choices, notice] = await Promise.all([db.select().from(media).orderBy(desc(media.createdAt)), db.select().from(products).orderBy(asc(products.name)), searchParams]);
  return <><AdminHeading title="Add banner" description="Set its placement, timing and content." /><AdminNotice {...notice} /><div style={{ marginTop: 16 }}><BannerEditor images={images} products={choices} /></div></>;
}
