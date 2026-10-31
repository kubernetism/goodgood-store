import Link from "next/link";
import type { banners, products } from "@/db/schema";
import { deleteBanner, saveBanner } from "@/features/admin/actions";
import { bannerPlacements } from "@/features/banners/model";
import { dateToPktLocal } from "@/lib/pk-time";
import type { ImageOption } from "./image-options";
import { ImageSelect } from "./image-select";
import { MediaOptionsProvider } from "./media-options";
import { SubmitButton } from "./submit-button";
import { DangerZone, Field } from "./ui";

export function BannerEditor({ banner, images, products: choices }: { banner?: typeof banners.$inferSelect; images: ImageOption[]; products: Pick<typeof products.$inferSelect, "id" | "name">[] }) {
  return <MediaOptionsProvider images={images}>
    <form action={saveBanner} className="admin-panel admin-form">
      {banner && <input type="hidden" name="id" value={banner.id} />}
      <p className="admin-form-note">All fields are required unless marked optional.</p>
      <fieldset className="admin-section">
        <legend>Placement and order</legend>
        <div className="admin-columns">
          <Field label="Placement"><select name="placement" defaultValue={banner?.placement ?? "hero"}>{bannerPlacements.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}</select></Field>
          <Field label="Display order" hint="The live banner with the lowest number is shown."><input name="sortOrder" type="number" inputMode="numeric" min="0" max="9999" defaultValue={banner?.sortOrder ?? 0} /></Field>
        </div>
      </fieldset>
      <fieldset className="admin-section">
        <legend>Message</legend>
        <Field label="Title"><input name="title" defaultValue={banner?.title} maxLength={120} required /></Field>
        <Field label="Subtitle" optional><textarea name="subtitle" maxLength={300} rows={2} defaultValue={banner?.subtitle ?? ""} /></Field>
        <div className="admin-columns">
          <Field label="Button label" optional><input name="ctaLabel" maxLength={40} defaultValue={banner?.ctaLabel ?? ""} /></Field>
          <Field label="Button link" optional hint="A site path like /shop or a full https:// link."><input name="ctaHref" maxLength={500} placeholder="/shop" defaultValue={banner?.ctaHref ?? ""} /></Field>
        </div>
      </fieldset>
      <fieldset className="admin-section">
        <legend>Image and product</legend>
        <div className="admin-columns">
          <ImageSelect label="Image" name="imageId" defaultValue={banner?.imageId ?? ""} emptyLabel="Use the fallback image" />
          <Field label="Deal product" optional hint="Deal banners show this product’s price and link."><select name="productId" defaultValue={banner?.productId ?? ""}><option value="">None</option>{choices.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></Field>
        </div>
      </fieldset>
      <fieldset className="admin-section">
        <legend>Schedule</legend>
        <p className="admin-hint">Pakistan time (PKT). Leave both empty to show the banner any time.</p>
        <div className="admin-columns">
          <Field label="Starts" optional><input name="startsAt" type="datetime-local" defaultValue={banner?.startsAt ? dateToPktLocal(banner.startsAt) : ""} /></Field>
          <Field label="Ends" optional><input name="endsAt" type="datetime-local" defaultValue={banner?.endsAt ? dateToPktLocal(banner.endsAt) : ""} /></Field>
        </div>
        <label className="admin-switch"><input type="checkbox" name="isActive" defaultChecked={banner?.isActive ?? true} /> Banner is switched on</label>
      </fieldset>
      <div className="admin-save-bar">
        <SubmitButton>Save banner</SubmitButton>
        <Link className="admin-button quiet" href="/admin/banners">Cancel</Link>
      </div>
    </form>
    {banner && <div className="admin-danger-group"><DangerZone summary="Delete this banner">
      <p>This permanently removes the banner. You can instead switch it off to hide it.</p>
      <form action={deleteBanner} className="admin-form"><input type="hidden" name="id" value={banner.id} /><label className="check"><input type="checkbox" name="confirm" value="yes" required /> Confirm banner deletion</label><div><SubmitButton variant="danger" pendingLabel="Deleting…">Delete banner</SubmitButton></div></form>
    </DangerZone></div>}
  </MediaOptionsProvider>;
}
