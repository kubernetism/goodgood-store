import Image from "next/image";
import { desc } from "drizzle-orm";
import { db } from "@/db/client";
import { media } from "@/db/schema";
import { deleteMedia, uploadMedia } from "@/features/admin/actions";
import { AdminHeading, AdminNotice, Pager, pageNumber } from "@/features/admin/ui";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string; page?: string }> }) {
  await requireAdmin(); const p = await searchParams; const page = pageNumber(p.page);
  const images = await db.select().from(media).orderBy(desc(media.createdAt)).limit(21).offset((page - 1) * 20);
  return <><AdminHeading title="Media library" description="Upload images for products, banners and site content." /><AdminNotice {...p} /><section className="admin-panel" style={{ marginTop: 16 }}><h2>Upload an image</h2><p className="admin-muted">JPEG, PNG, WebP or AVIF. Maximum 4 MB. Alt text describes the image for accessibility.</p><form action={uploadMedia} className="admin-form"><div className="admin-columns"><label>Image<input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/avif" required /></label><label>Alt text<input name="alt" maxLength={250} required /></label></div><div><button className="admin-button">Upload image</button></div></form></section>
    <div className="admin-grid" style={{ marginTop: 16 }}>{images.slice(0, 20).map((image) => <article className="admin-panel" key={image.id}><div style={{ position: "relative", aspectRatio: "4/3", background: "#f3ece1" }}><Image src={image.url} alt={image.alt} fill sizes="220px" style={{ objectFit: "contain" }} /></div><p>{image.alt}</p><p className="admin-muted">{Math.round(image.sizeBytes / 1024)} KB</p><details><summary>Delete image</summary><p className="admin-muted">This removes the image from all products, banners and content slots.</p><form action={deleteMedia} className="admin-form"><input type="hidden" name="id" value={image.id} /><label className="check"><input type="checkbox" name="confirm" value="yes" required /> Confirm deletion</label><button className="admin-button secondary">Delete image</button></form></details></article>)}</div>{!images.length && <p className="admin-muted">Your media library is empty.</p>}<Pager page={page} hasNext={images.length > 20} base="/admin/media" /></>;
}
