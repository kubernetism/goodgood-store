import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { Images } from "lucide-react";
import { db } from "@/db/client";
import { media } from "@/db/schema";
import { deleteMedia, uploadMedia } from "@/features/admin/actions";
import { DropUpload } from "@/features/admin/drop-upload";
import { emptyMediaUsage, isMediaUnused, mediaDeleteWarning, mediaUsageGroups, summariseNames } from "@/features/admin/media-usage";
import { loadMediaUsage } from "@/features/admin/media-usage-data";
import { SubmitButton } from "@/features/admin/submit-button";
import { AdminHeading, AdminNotice, DangerZone, EmptyState, Field, Pager, pageNumber, StatusPill } from "@/features/admin/ui";
import { formatPktDateTime } from "@/lib/pk-time";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;
export const metadata: Metadata = { title: "Media" };

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string; page?: string; unused?: string }> }) {
  await requireAdmin();
  const p = await searchParams;
  const page = pageNumber(p.page);
  const unusedOnly = p.unused === "1";
  const images = await db.select().from(media).orderBy(desc(media.createdAt)).limit(21).offset((page - 1) * 20);
  const pageImages = images.slice(0, 20);
  const usageById = await loadMediaUsage(pageImages.map((image) => image.id));
  const cards = pageImages.map((image) => ({ image, usage: usageById.get(image.id) ?? emptyMediaUsage() })).filter(({ usage }) => !unusedOnly || isMediaUnused(usage));
  const base = `/admin/media${unusedOnly ? "?unused=1" : ""}`;

  return <div className="admin-page">
    <AdminHeading eyebrow="Website" title="Media library" description="Images for products, banners and site content." />
    <AdminNotice {...p} message={p.saved ? "Media library updated." : undefined} />
    <section className="admin-panel" aria-labelledby="upload-title">
      <div className="admin-panel-head"><h2 id="upload-title">Upload an image</h2></div>
      <form action={uploadMedia} className="admin-form">
        <DropUpload id="media-upload-file" name="image" accept="image/jpeg,image/png,image/webp,image/avif" />
        <Field label="Image description (alt text)" hint="Describe what is in the photo, e.g. “Sidr honey 500 g jar on a wooden table”. It helps people using screen readers and search engines.">
          <input name="alt" maxLength={250} required />
        </Field>
        <div><SubmitButton pendingLabel="Uploading…">Upload image</SubmitButton></div>
      </form>
    </section>
    <section className="admin-stack" aria-labelledby="library-title">
      <div className="admin-panel-head">
        <h2 id="library-title">Library</h2>
        <Link className="admin-filter-chip" href={unusedOnly ? "/admin/media" : "/admin/media?unused=1"}>{unusedOnly ? "Showing unused only · Show all" : "Show unused only"}</Link>
      </div>
      {cards.length ? <ul className="admin-media-grid">{cards.map(({ image, usage }) => {
        const unused = isMediaUnused(usage);
        return <li key={image.id} className="admin-media-card">
          <div className="admin-media-tile"><Image src={image.url} alt={image.alt} fill sizes="(max-width: 768px) 50vw, 220px" /></div>
          <p className="admin-media-alt admin-clamp" title={image.alt}>{image.alt}</p>
          <p className="admin-hint">{Math.round(image.sizeBytes / 1024)} KB · {formatPktDateTime(image.createdAt)}</p>
          <div className="admin-media-usage">
            {unused ? <span><StatusPill tone="neutral" label="Not used" /></span> : <><span className="admin-eyebrow">Used in</span><ul>{mediaUsageGroups(usage).map((group) => <li key={group.label}><strong>{group.label}:</strong> {summariseNames(group.names)}</li>)}</ul></>}
          </div>
          <DangerZone summary="Delete image…">
            <p className={unused ? undefined : "admin-field-error"}>{mediaDeleteWarning(usage)}</p>
            <form action={deleteMedia} className="admin-form">
              <input type="hidden" name="id" value={image.id} />
              <label className="check"><input type="checkbox" name="confirm" value="yes" required /> {unused ? "Confirm deletion" : "I understand where this image will be removed"}</label>
              <div><SubmitButton variant="danger" size="sm" pendingLabel="Deleting…">Delete image</SubmitButton></div>
            </form>
          </DangerZone>
        </li>;
      })}</ul> : <div className="admin-panel"><EmptyState icon={<Images />} title={unusedOnly ? "No unused images on this page" : "Your media library is empty"}
        actions={unusedOnly ? <Link className="admin-button secondary" href="/admin/media">Show all images</Link> : undefined}>
        {unusedOnly ? "Every image here is in use." : "Upload your first image above."}
      </EmptyState></div>}
      <Pager page={page} hasNext={images.length > 20} base={base} />
    </section>
  </div>;
}
