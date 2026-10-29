import { asc, desc } from "drizzle-orm";
import { db } from "@/db/client";
import { categories, contentSlots, media } from "@/db/schema";
import { saveCategoryImage, saveSlot } from "@/features/admin/actions";
import { AdminHeading, AdminNotice } from "@/features/admin/ui";
import { slotDefinitions } from "@/features/content/slots";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;

export default async function ContentPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireAdmin(); const [slots, images, notice, varieties] = await Promise.all([db.select().from(contentSlots), db.select().from(media).orderBy(desc(media.createdAt)), searchParams, db.select().from(categories).orderBy(asc(categories.sortOrder))]);
  const assigned = new Map(slots.map((s) => [s.key, s]));
  return <><AdminHeading title="Site content" description="Assign media and a YouTube video to the storefront." /><AdminNotice {...notice} />{slotDefinitions.map((slot, index) => {
    const showGroup = index === 0 || slotDefinitions[index - 1]?.group !== slot.group; const item = assigned.get(slot.key);
    return <section key={slot.key} style={{ marginTop: 16 }}>{showGroup && <h2 style={{ margin: "28px 0 12px" }}>{slot.group}</h2>}<form action={saveSlot} className="admin-panel admin-form"><input type="hidden" name="key" value={slot.key} /><div><strong>{slot.label}</strong><p className="admin-muted">{slot.hint}</p></div><label>Image<select name="mediaId" defaultValue={item?.mediaId ?? ""}><option value="">Use default or placeholder</option>{images.map((image) => <option key={image.id} value={image.id}>{image.alt}</option>)}</select></label>{slot.kind === "video" && <label>YouTube link<input name="youtube" defaultValue={item?.youtubeId ? `https://www.youtube.com/watch?v=${item.youtubeId}` : ""} placeholder="https://www.youtube.com/watch?v=…" /></label>}<div><button className="admin-button secondary">Save {slot.label}</button></div></form></section>;
  })}<h2 style={{ margin: "28px 0 12px" }}>Honey variety images</h2>{varieties.map((category) => <form key={category.id} action={saveCategoryImage} className="admin-panel admin-form" style={{ marginTop: 16 }}><input type="hidden" name="categoryId" value={category.id} /><label>{category.name} image<select name="mediaId" defaultValue={category.imageId ?? ""}><option value="">Use default or placeholder</option>{images.map((image) => <option key={image.id} value={image.id}>{image.alt}</option>)}</select></label><div><button className="admin-button secondary">Save {category.name} image</button></div></form>)}</>;
}
