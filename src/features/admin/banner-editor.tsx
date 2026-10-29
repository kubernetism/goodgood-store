import type { banners, media, products } from "@/db/schema";
import { deleteBanner, saveBanner } from "@/features/admin/actions";
import { bannerPlacements } from "@/features/banners/model";
import { dateToPktLocal } from "@/lib/pk-time";

export function BannerEditor({ banner, images, products: choices }: { banner?: typeof banners.$inferSelect; images: (typeof media.$inferSelect)[]; products: (typeof products.$inferSelect)[] }) {
  return <><form action={saveBanner} className="admin-panel admin-form">
    {banner && <input type="hidden" name="id" value={banner.id} />}
    <div className="admin-columns"><label>Placement<select name="placement" defaultValue={banner?.placement ?? "hero"}>{bannerPlacements.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}</select></label><label>Display order<input name="sortOrder" type="number" min="0" max="9999" defaultValue={banner?.sortOrder ?? 0} /></label></div>
    <label>Title<input name="title" defaultValue={banner?.title} maxLength={120} required /></label><label>Subtitle<textarea name="subtitle" maxLength={300} defaultValue={banner?.subtitle ?? ""} /></label>
    <div className="admin-columns"><label>Button label<input name="ctaLabel" maxLength={40} defaultValue={banner?.ctaLabel ?? ""} /></label><label>Button link<input name="ctaHref" maxLength={500} placeholder="/shop" defaultValue={banner?.ctaHref ?? ""} /></label></div>
    <div className="admin-columns"><label>Image<select name="imageId" defaultValue={banner?.imageId ?? ""}><option value="">Use fallback</option>{images.map((image) => <option key={image.id} value={image.id}>{image.alt}</option>)}</select></label><label>Deal product<select name="productId" defaultValue={banner?.productId ?? ""}><option value="">None</option>{choices.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label></div>
    <div className="admin-columns"><label>Starts (Pakistan time)<input name="startsAt" type="datetime-local" defaultValue={banner?.startsAt ? dateToPktLocal(banner.startsAt) : ""} /></label><label>Ends (Pakistan time)<input name="endsAt" type="datetime-local" defaultValue={banner?.endsAt ? dateToPktLocal(banner.endsAt) : ""} /></label></div>
    <label className="check"><input type="checkbox" name="isActive" defaultChecked={banner?.isActive ?? true} /> Active</label><div><button className="admin-button">Save banner</button></div>
  </form>{banner && <details className="admin-panel" style={{ marginTop: 16 }}><summary>Delete this banner</summary><p className="admin-muted">This permanently removes the banner. You can instead uncheck Active to hide it.</p><form action={deleteBanner} className="admin-form"><input type="hidden" name="id" value={banner.id} /><label className="check"><input type="checkbox" name="confirm" value="yes" required /> Confirm banner deletion</label><button className="admin-button secondary">Delete banner</button></form></details>}</>;
}
