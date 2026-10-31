import type { Metadata } from "next";
import { asc, desc } from "drizzle-orm";
import { db } from "@/db/client";
import { categories, contentSlots, media } from "@/db/schema";
import { saveCategoryImage, saveSlot } from "@/features/admin/actions";
import { DirtyForm } from "@/features/admin/dirty-form";
import { toImageOptions } from "@/features/admin/image-options";
import { ImageSelect } from "@/features/admin/image-select";
import { MediaOptionsProvider } from "@/features/admin/media-options";
import { SubmitButton } from "@/features/admin/submit-button";
import { AdminHeading, AdminNotice, Field, StatusPill } from "@/features/admin/ui";
import { slotDefinitions, type SlotDefinition } from "@/features/content/slots";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;
export const metadata: Metadata = { title: "Site content" };

const anchorFor = (group: string) => `group-${group.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
const VARIETIES = "Honey variety images";

function UnsavedPill() {
  return <span className="admin-unsaved"><StatusPill tone="honey" label="Unsaved" /></span>;
}

export default async function ContentPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireAdmin();
  const [slots, images, notice, varieties] = await Promise.all([
    db.select().from(contentSlots),
    db.select({ id: media.id, alt: media.alt, url: media.url }).from(media).orderBy(desc(media.createdAt)),
    searchParams,
    db.select().from(categories).orderBy(asc(categories.sortOrder)),
  ]);
  const assigned = new Map(slots.map((slot) => [slot.key, slot]));
  const groups = [...new Set(slotDefinitions.map((slot) => slot.group))].map((group) => ({ group, slots: slotDefinitions.filter((slot) => slot.group === group) }));
  const index = [...groups.map(({ group }) => group), VARIETIES];

  return <div className="admin-page">
    <AdminHeading eyebrow="Website" title="Site content" description="Choose the photos and video shown on the storefront. Each card saves on its own." />
    <AdminNotice {...notice} message="Content saved. The storefront now shows it." />
    <div className="admin-content-layout">
      <nav className="admin-content-index" aria-label="Content sections">
        <details>
          <summary>Jump to a section</summary>
          <ul>{index.map((group) => <li key={group}><a href={`#${anchorFor(group)}`}>{group}</a></li>)}</ul>
        </details>
      </nav>
      <MediaOptionsProvider images={toImageOptions(images)}>
        <div className="admin-stack-lg">
          {groups.map(({ group, slots: groupSlots }) => <section key={group} id={anchorFor(group)} className="admin-content-group" aria-labelledby={`${anchorFor(group)}-title`}>
            <h2 id={`${anchorFor(group)}-title`}>{group}</h2>
            <div className="admin-slot-grid">{groupSlots.map((slot) => <SlotCard key={slot.key} slot={slot} mediaId={assigned.get(slot.key)?.mediaId ?? ""} youtubeId={assigned.get(slot.key)?.youtubeId ?? null} />)}</div>
          </section>)}
          <section id={anchorFor(VARIETIES)} className="admin-content-group" aria-labelledby={`${anchorFor(VARIETIES)}-title`}>
            <h2 id={`${anchorFor(VARIETIES)}-title`}>{VARIETIES}</h2>
            <div className="admin-slot-grid">{varieties.map((category) => <DirtyForm key={category.id} action={saveCategoryImage} className="admin-panel admin-form admin-slot" labelledBy={`variety-${category.id}`}>
              <input type="hidden" name="categoryId" value={category.id} />
              <div className="admin-slot-head"><h3 id={`variety-${category.id}`}>{category.name}</h3><UnsavedPill /></div>
              <ImageSelect label="Image" name="mediaId" defaultValue={category.imageId ?? ""} />
              <div><SubmitButton variant="secondary" size="sm" ariaLabel={`Save ${category.name} image`}>Save</SubmitButton></div>
            </DirtyForm>)}</div>
          </section>
        </div>
      </MediaOptionsProvider>
    </div>
  </div>;
}

function SlotCard({ slot, mediaId, youtubeId }: { slot: SlotDefinition; mediaId: string; youtubeId: string | null }) {
  const headingId = `slot-${slot.key.replace(/[^a-z0-9]+/gi, "-")}`;
  return <DirtyForm action={saveSlot} className="admin-panel admin-form admin-slot" labelledBy={headingId}>
    <input type="hidden" name="key" value={slot.key} />
    <div className="admin-slot-head"><h3 id={headingId}>{slot.label}</h3><UnsavedPill /></div>
    <p className="admin-hint">{slot.hint}</p>
    <ImageSelect label="Image" name="mediaId" defaultValue={mediaId} />
    {slot.kind === "video" && <Field label="YouTube link" optional><input name="youtube" inputMode="url" defaultValue={youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : ""} placeholder="https://www.youtube.com/watch?v=…" /></Field>}
    <div><SubmitButton variant="secondary" size="sm" ariaLabel={`Save ${slot.label}`}>Save</SubmitButton></div>
  </DirtyForm>;
}
