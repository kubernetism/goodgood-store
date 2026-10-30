import type { categories, media } from "@/db/schema";
import { deleteCategory, saveCategory } from "./actions";
import { ImageSelect } from "./image-select";

type Category = typeof categories.$inferSelect;
type Media = typeof media.$inferSelect;

export function CategoryEditor({ category, images, productCount = 0 }: { category?: Category; images: Media[]; productCount?: number }) {
  return <>
    <form action={saveCategory} className="admin-form admin-panel">
      {category && <input type="hidden" name="id" value={category.id} />}
      <div className="admin-columns">
        <label>Name<input name="name" defaultValue={category?.name} maxLength={150} required /></label>
        <label>Slug<input name="slug" defaultValue={category?.slug} maxLength={120} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="sidr-honey" required /></label>
      </div>
      <p className="admin-muted">The slug is used in category links. Changing it can break existing links.</p>
      <label>Description<textarea name="blurb" defaultValue={category?.blurb ?? ""} maxLength={1000} /></label>
      <div className="admin-columns">
        <label>Display order<input type="number" name="sortOrder" min="0" max="1000000" defaultValue={category?.sortOrder ?? 0} required /></label>
        <ImageSelect label="Category image" name="imageId" defaultValue={category?.imageId ?? ""} images={images.map(({ id, alt }) => ({ id, alt }))} />
      </div>
      <label className="check"><input type="checkbox" name="isActive" value="yes" defaultChecked={category?.isActive ?? true} /> Category is active</label>
      <p className="admin-muted">An active category appears in the Shop menu when it contains an active product. Hiding a category also hides its products from the website.</p>
      <div><button className="admin-button">Save category</button></div>
    </form>
    {category && <details className="admin-panel" style={{ marginTop: 16 }}><summary>Delete this category</summary>
      {productCount ? <p className="admin-muted">This category contains {productCount} {productCount === 1 ? "product" : "products"}, including inactive products. Move or delete them before deleting the category. You can hide the category instead.</p> : <><p className="admin-muted">This permanently deletes the category. Its image remains in the media library.</p><form action={deleteCategory} className="admin-form"><input type="hidden" name="id" value={category.id} /><label className="check"><input type="checkbox" name="confirm" value="yes" required /> I understand this category will be permanently deleted</label><div><button className="admin-button secondary">Delete category</button></div></form></>}
    </details>}
  </>;
}
