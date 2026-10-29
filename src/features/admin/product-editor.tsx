import { saveProduct, archiveProduct } from "@/features/admin/actions";
import { productTags } from "@/features/products/types";
import type { categories, media, products } from "@/db/schema";

type Product = typeof products.$inferSelect;
type Category = typeof categories.$inferSelect;
type Media = typeof media.$inferSelect;

export function ProductEditor({ product, categories: choices, images, selectedImages }: { product?: Product; categories: Category[]; images: Media[]; selectedImages: string[] }) {
  const price = (p: number | null | undefined) => p == null ? "" : (p / 100).toFixed(2);
  const fields = [
    ["unit", "Unit / pack size", product?.unit], ["origin", "Origin", product?.origin], ["harvest", "Harvest", product?.harvest],
    ["floralSource", "Floral source", product?.floralSource], ["tasteNotes", "Taste notes", product?.tasteNotes],
  ] as const;
  return <><form action={saveProduct} className="admin-form admin-panel">
    {product && <input type="hidden" name="id" value={product.id} />}
    <div className="admin-columns"><label>Name<input name="name" defaultValue={product?.name} required maxLength={150} /></label><label>Slug<input name="slug" defaultValue={product?.slug} required placeholder="sidr-honey-500g" pattern="[a-z0-9]+(-[a-z0-9]+)*" /></label></div>
    <div className="admin-columns"><label>Category<select name="categoryId" defaultValue={product?.categoryId} required><option value="">Choose a category</option>{choices.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Status<select name="status" defaultValue={product?.status ?? "draft"}><option value="draft">Draft</option><option value="active">Active</option><option value="archived">Archived</option></select></label></div>
    <div className="admin-columns"><label>Price (Rs)<input name="price" type="number" min="0.01" max="9999999" step="0.01" defaultValue={price(product?.price)} required /></label><label>Compare-at price (Rs, optional)<input name="compareAtPrice" type="number" min="0.01" max="9999999" step="0.01" defaultValue={price(product?.compareAtPrice)} /></label></div>
    <div className="admin-columns"><label>Stock quantity<input name="stock" type="number" min="0" max="1000000" defaultValue={product?.stock ?? 0} required /></label><label>Listed on<input name="listedOn" type="date" defaultValue={product?.listedOn ?? new Date().toISOString().slice(0, 10)} required /></label></div>
    <div className="admin-columns"><label>Rating<input name="rating" type="number" min="0" max="5" step="0.1" defaultValue={product?.rating ?? 0} required /></label><label>Review count<input name="reviewCount" type="number" min="0" defaultValue={product?.reviewCount ?? 0} required /></label></div>
    <label>Display order<input name="sortOrder" type="number" min="0" defaultValue={product?.sortOrder ?? 0} required /></label>
    <div className="admin-columns">{fields.map(([name, label, defaultValue]) => <label key={name}>{label}<input name={name} defaultValue={defaultValue} required /></label>)}</div>
    <label>Short summary<textarea name="summary" defaultValue={product?.summary} required /></label><label>Description<textarea name="description" defaultValue={product?.description} required /></label>
    <fieldset><legend>Tags</legend><div className="admin-actions">{productTags.map((tag) => <label key={tag} className="check"><input type="checkbox" name="tags" value={tag} defaultChecked={product?.tags.includes(tag)} />{tag}</label>)}</div></fieldset>
    <fieldset><legend>Product images</legend><p className="admin-muted">Upload images in Media first. The first selected image is the primary image; the rest appear in the order below.</p><div className="admin-columns">{Array.from({ length: Math.min(20, Math.max(5, selectedImages.length + 1)) }, (_, i) => <label key={i}>Image {i + 1}{i === 0 ? " (primary)" : ""}<select name="imageId" defaultValue={selectedImages[i] ?? ""}><option value="">None</option>{images.map((image) => <option key={image.id} value={image.id}>{image.alt}</option>)}</select></label>)}</div></fieldset>
    <div className="admin-actions"><button className="admin-button">Save product</button></div>
  </form>{product && product.status !== "archived" && <details className="admin-panel" style={{ marginTop: 16 }}><summary>Archive this product</summary><p className="admin-muted">Archiving removes it from the storefront. You can restore it by changing its status.</p><form action={archiveProduct} className="admin-form"><input type="hidden" name="id" value={product.id} /><label className="check"><input type="checkbox" name="confirm" value="yes" required /> I want to archive this product</label><button className="admin-button secondary">Archive product</button></form></details>}</>;
}
