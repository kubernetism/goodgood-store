import type { Metadata } from "next";
import { asc, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { z } from "zod";
import { db } from "@/db/client";
import { banners, media, products } from "@/db/schema";
import { BannerEditor } from "@/features/admin/banner-editor";
import { toImageOptions } from "@/features/admin/image-options";
import { bannerScheduleStatus, bannerStatusDisplay } from "@/features/admin/status-display";
import { AdminHeading, AdminNotice, StatusPill } from "@/features/admin/ui";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;
export const metadata: Metadata = { title: "Edit banner" };

export default async function EditBanner({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [rows, images, choices, notice] = await Promise.all([
    db.select().from(banners).where(eq(banners.id, id)).limit(1),
    db.select({ id: media.id, alt: media.alt, url: media.url }).from(media).orderBy(desc(media.createdAt)),
    db.select({ id: products.id, name: products.name }).from(products).orderBy(asc(products.name)),
    searchParams,
  ]);
  const banner = rows[0];
  if (!banner) notFound();
  const status = bannerStatusDisplay[bannerScheduleStatus(banner, new Date())];
  return <div className="admin-page">
    <AdminHeading back={{ href: "/admin/banners", label: "Back to banners" }} eyebrow="Website" title={banner.title} meta={<StatusPill tone={status.tone} label={status.label} />} />
    <AdminNotice error={notice.error} saved={notice.saved} message="Banner saved." />
    <BannerEditor banner={banner} images={toImageOptions(images)} products={choices} />
  </div>;
}
