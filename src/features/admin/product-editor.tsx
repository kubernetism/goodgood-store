import Link from "next/link";
import { archiveProduct, deleteProduct, saveProduct } from "@/features/admin/actions";
import { productTags } from "@/features/products/types";
import type { categories, products } from "@/db/schema";
import { GalleryPicker } from "./gallery-picker";
import type { ImageOption } from "./image-options";
import { MediaOptionsProvider } from "./media-options";
import { SubmitButton } from "./submit-button";
import { DangerZone, Field } from "./ui";

type Product = typeof products.$inferSelect;
type Category = typeof categories.$inferSelect;

const SLUG_PATTERN = "[a-z0-9]+(-[a-z0-9]+)*";
const SLUG_TITLE = "Use lowercase letters, numbers and dashes, for example sidr-honey-500g.";

export function ProductEditor({ product, categories: choices, images, selectedImages, showDelete = false }: { product?: Product; categories: Category[]; images: ImageOption[]; selectedImages: string[]; showDelete?: boolean }) {
  const price = (p: number | null | undefined) => p == null ? "" : (p / 100).toFixed(2);
  const details = [
    ["unit", "Unit or pack size", product?.unit, "For example 500 g jar."], ["origin", "Origin", product?.origin, undefined], ["harvest", "Harvest", product?.harvest, undefined],
    ["floralSource", "Floral source", product?.floralSource, undefined], ["tasteNotes", "Taste notes", product?.tasteNotes, undefined],
  ] as const;
  return <MediaOptionsProvider images={images}>
    <form action={saveProduct} className="admin-form admin-panel">
      {product && <input type="hidden" name="id" value={product.id} />}
      <p className="admin-form-note">All fields are required unless marked optional.</p>

      <fieldset className="admin-section">
        <legend>Basics</legend>
        <div className="admin-columns">
          <Field label="Name"><input name="name" defaultValue={product?.name} required maxLength={150} /></Field>
          <Field label="Slug" hint="Lowercase letters, numbers and dashes. Changing it breaks old links.">
            <SlugInput prefix="/shop/" name="slug" defaultValue={product?.slug} placeholder="sidr-honey-500g" />
          </Field>
        </div>
        <div className="admin-columns">
          <Field label="Category" hint={<>Products in hidden categories are not shown. <Link href="/admin/categories">Manage categories</Link></>}>
            <select name="categoryId" defaultValue={product?.categoryId} required><option value="">Choose a category</option>{choices.map((c) => <option key={c.id} value={c.id}>{c.name}{c.isActive ? "" : " (hidden)"}</option>)}</select>
          </Field>
          <div className="admin-field">
            <span className="admin-label">Website visibility</span>
            <input type="hidden" name="inactiveStatus" value={product?.status === "archived" ? "archived" : "draft"} />
            <label className="admin-switch"><input type="checkbox" name="active" value="yes" defaultChecked={product?.status === "active"} /> Show on the website</label>
            <p className="admin-hint">{product?.status === "archived" ? "This product is archived. Switch it on and save to restore it." : "Takes effect when you save."}</p>
          </div>
        </div>
      </fieldset>

      <fieldset className="admin-section">
        <legend>Price and stock</legend>
        <div className="admin-columns">
          <Field label="Price"><MoneyInput name="price" defaultValue={price(product?.price)} required /></Field>
          <Field label="Compare-at price" optional hint="The old price, shown struck through. Must be higher than the price."><MoneyInput name="compareAtPrice" defaultValue={price(product?.compareAtPrice)} /></Field>
        </div>
        <div className="admin-columns">
          <Field label="Stock quantity"><input name="stock" type="number" inputMode="numeric" min="0" max="1000000" defaultValue={product?.stock ?? 0} required /></Field>
          <Field label="Listed on"><input name="listedOn" type="date" defaultValue={product?.listedOn ?? new Date().toISOString().slice(0, 10)} required /></Field>
        </div>
      </fieldset>

      <fieldset className="admin-section">
        <legend>Images</legend>
        <p className="admin-hint">The first image is the primary image. Use the arrows to change the order.</p>
        <GalleryPicker name="imageId" defaultValue={selectedImages} />
      </fieldset>

      <fieldset className="admin-section">
        <legend>Honey details</legend>
        <div className="admin-columns">{details.map(([name, label, defaultValue, hint]) => <Field key={name} label={label} hint={hint}><input name={name} defaultValue={defaultValue} required /></Field>)}</div>
      </fieldset>

      <fieldset className="admin-section">
        <legend>Description</legend>
        <Field label="Short summary" hint="One or two sentences for product cards."><textarea name="summary" defaultValue={product?.summary} rows={3} required /></Field>
        <Field label="Description"><textarea name="description" defaultValue={product?.description} rows={8} required /></Field>
      </fieldset>

      <fieldset className="admin-section">
        <legend>Tags</legend>
        <div className="admin-chip-group">{productTags.map((tag) => <label key={tag} className="admin-chip-check"><input type="checkbox" name="tags" value={tag} defaultChecked={product?.tags.includes(tag)} />{tag}</label>)}</div>
      </fieldset>

      <fieldset className="admin-section">
        <legend>Display and ratings</legend>
        <div className="admin-columns">
          <Field label="Display order" hint="Lower numbers appear first in the shop."><input name="sortOrder" type="number" inputMode="numeric" min="0" defaultValue={product?.sortOrder ?? 0} required /></Field>
        </div>
        <p className="admin-hint">Enter only real customer ratings you can show if asked.</p>
        <div className="admin-columns">
          <Field label="Rating" hint="0 to 5."><input name="rating" type="number" inputMode="decimal" min="0" max="5" step="0.1" defaultValue={product?.rating ?? 0} required /></Field>
          <Field label="Review count"><input name="reviewCount" type="number" inputMode="numeric" min="0" defaultValue={product?.reviewCount ?? 0} required /></Field>
        </div>
      </fieldset>

      <div className="admin-save-bar">
        <SubmitButton>Save product</SubmitButton>
        <Link className="admin-button quiet" href="/admin/products">Cancel</Link>
      </div>
    </form>
    {product && <div className="admin-danger-group">
      {product.status !== "archived" && <DangerZone summary="Archive this product">
        <p>Archiving removes it from the storefront. You can restore it later by switching it on and saving.</p>
        <form action={archiveProduct} className="admin-form"><input type="hidden" name="id" value={product.id} /><label className="check"><input type="checkbox" name="confirm" value="yes" required /> I want to archive this product</label><div><SubmitButton variant="secondary" pendingLabel="Archiving…">Archive product</SubmitButton></div></form>
      </DangerZone>}
      <DangerZone id="delete-product" open={showDelete} summary="Delete this product">
        <p>This permanently removes the product and its gallery assignments. Existing order details remain, but cancelled orders can no longer restore stock for this product. Linked banners will no longer reference it. Archive the product instead if you may need it later.</p>
        <form action={deleteProduct} className="admin-form"><input type="hidden" name="id" value={product.id} /><label className="check"><input type="checkbox" name="confirm" value="yes" required /> I understand this product will be permanently deleted</label><div><SubmitButton variant="danger" pendingLabel="Deleting…">Delete product</SubmitButton></div></form>
      </DangerZone>
    </div>}
  </MediaOptionsProvider>;
}

/** Slug field with its URL prefix shown as an adornment. Field passes id/aria-describedby. */
export function SlugInput({ prefix, name, defaultValue, placeholder, id, "aria-describedby": describedBy }: { prefix: string; name: string; defaultValue?: string; placeholder?: string; id?: string; "aria-describedby"?: string }) {
  return <span className="admin-affix"><span aria-hidden="true">{prefix}</span><input id={id} aria-describedby={describedBy} className="admin-ident-input" name={name} defaultValue={defaultValue} required maxLength={120} placeholder={placeholder} pattern={SLUG_PATTERN} title={SLUG_TITLE} autoCapitalize="none" autoCorrect="off" spellCheck={false} /></span>;
}

/** Rupee amount with an "Rs" adornment, right-aligned figures. */
export function MoneyInput({ name, defaultValue, required = false, id, "aria-describedby": describedBy }: { name: string; defaultValue?: string; required?: boolean; id?: string; "aria-describedby"?: string }) {
  return <span className="admin-affix money"><span aria-hidden="true">Rs</span><input id={id} aria-describedby={describedBy} name={name} type="number" inputMode="decimal" min="0.01" max="9999999" step="0.01" defaultValue={defaultValue} required={required} /></span>;
}
