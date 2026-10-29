import { asc, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { z } from "zod";
import { db } from "@/db/client";
import { banners, media, products } from "@/db/schema";
import { BannerEditor } from "@/features/admin/banner-editor";
import { AdminHeading, AdminNotice } from "@/features/admin/ui";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;

export default async function EditBanner({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireAdmin(); const { id } = await params; if (!z.uuid().safeParse(id).success) notFound();
  const [rows, images, choices, notice] = await Promise.all([db.select().from(banners).where(eq(banners.id, id)).limit(1), db.select().from(media).orderBy(desc(media.createdAt)), db.select().from(products).orderBy(asc(products.name)), searchParams]);
  const banner = rows[0]; if (!banner) notFound();
  return <><AdminHeading title={banner.title} description="Edit this promotion." /><AdminNotice {...notice} /><div style={{ marginTop: 16 }}><BannerEditor banner={banner} images={images} products={choices} /></div></>;
}
