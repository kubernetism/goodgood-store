import Link from "next/link";
import type { categories } from "@/db/schema";
import { deleteCategory, saveCategory } from "./actions";
import type { ImageOption } from "./image-options";
import { ImageSelect } from "./image-select";
import { MediaOptionsProvider } from "./media-options";
import { SlugInput } from "./product-editor";
import { SubmitButton } from "./submit-button";
import { DangerZone, Field } from "./ui";

type Category = typeof categories.$inferSelect;

export function CategoryEditor({ category, images, productCount = 0 }: { category?: Category; images: ImageOption[]; productCount?: number }) {
  return <MediaOptionsProvider images={images}>
    <form action={saveCategory} className="admin-form admin-panel">
      {category && <input type="hidden" name="id" value={category.id} />}
      <p className="admin-form-note">All fields are required unless marked optional.</p>
      <fieldset className="admin-section">
        <legend>Category</legend>
        <div className="admin-columns">
          <Field label="Name"><input name="name" defaultValue={category?.name} maxLength={150} required /></Field>
          <Field label="Slug" hint="Used in shop links. Lowercase letters, numbers and dashes. Changing it breaks old links.">
            <SlugInput prefix="?category=" name="slug" defaultValue={category?.slug} placeholder="sidr-honey" />
          </Field>
        </div>
        <Field label="Description" optional><textarea name="blurb" defaultValue={category?.blurb ?? ""} maxLength={1000} rows={3} /></Field>
      </fieldset>
      <fieldset className="admin-section">
        <legend>Display</legend>
        <div className="admin-columns">
          <Field label="Display order" hint="Lower numbers appear first."><input type="number" inputMode="numeric" name="sortOrder" min="0" max="1000000" defaultValue={category?.sortOrder ?? 0} required /></Field>
          <ImageSelect label="Category image" name="imageId" defaultValue={category?.imageId ?? ""} />
        </div>
        <div className="admin-field">
          <label className="admin-switch"><input type="checkbox" name="isActive" value="yes" defaultChecked={category?.isActive ?? true} /> Category is shown</label>
          <p className="admin-hint">A shown category appears in the Shop menu when it contains an active product. Hiding a category also hides its products from the website.</p>
        </div>
      </fieldset>
      <div className="admin-save-bar">
        <SubmitButton>Save category</SubmitButton>
        <Link className="admin-button quiet" href="/admin/categories">Cancel</Link>
      </div>
    </form>
    {category && <div className="admin-danger-group"><DangerZone summary="Delete this category">
      {productCount
        ? <p>This category contains {productCount} {productCount === 1 ? "product" : "products"}, including inactive products, so it can’t be deleted. Move or delete them first, or hide the category instead by switching off “Category is shown” and saving.</p>
        : <><p>This permanently deletes the category. Its image remains in the media library.</p><form action={deleteCategory} className="admin-form"><input type="hidden" name="id" value={category.id} /><label className="check"><input type="checkbox" name="confirm" value="yes" required /> I understand this category will be permanently deleted</label><div><SubmitButton variant="danger" pendingLabel="Deleting…">Delete category</SubmitButton></div></form></>}
    </DangerZone></div>}
  </MediaOptionsProvider>;
}
