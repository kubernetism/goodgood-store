import type { Metadata } from "next";
import { asc, desc } from "drizzle-orm";
import { db } from "@/db/client";
import { media, products } from "@/db/schema";
import { BannerEditor } from "@/features/admin/banner-editor";
import { toImageOptions } from "@/features/admin/image-options";
import { AdminHeading, AdminNotice } from "@/features/admin/ui";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;
export const metadata: Metadata = { title: "Add banner" };

export default async function NewBanner({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireAdmin();
  const [images, choices, notice] = await Promise.all([
    db.select({ id: media.id, alt: media.alt, url: media.url }).from(media).orderBy(desc(media.createdAt)),
    db.select({ id: products.id, name: products.name }).from(products).orderBy(asc(products.name)),
    searchParams,
  ]);
  return <div className="admin-page">
    <AdminHeading back={{ href: "/admin/banners", label: "Back to banners" }} eyebrow="Website" title="Add banner" description="Set its placement, timing and content." />
    <AdminNotice {...notice} />
    <BannerEditor images={toImageOptions(images)} products={choices} />
  </div>;
}
