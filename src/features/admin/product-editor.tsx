import { saveProduct, archiveProduct, deleteProduct } from "@/features/admin/actions";
import Link from "next/link";
import { productTags } from "@/features/products/types";
import type { categories, media, products } from "@/db/schema";
import { ImageSelect } from "./image-select";

type Product = typeof products.$inferSelect;
type Category = typeof categories.$inferSelect;
type Media = typeof media.$inferSelect;

export function ProductEditor({ product, categories: choices, images, selectedImages, showDelete = false }: { product?: Product; categories: Category[]; images: Media[]; selectedImages: string[]; showDelete?: boolean }) {
  const price = (p: number | null | undefined) => p == null ? "" : (p / 100).toFixed(2);
  const fields = [
    ["unit", "Unit / pack size", product?.unit], ["origin", "Origin", product?.origin], ["harvest", "Harvest", product?.harvest],
    ["floralSource", "Floral source", product?.floralSource], ["tasteNotes", "Taste notes", product?.tasteNotes],
  ] as const;
  return <><form action={saveProduct} className="admin-form admin-panel">
    {product && <input type="hidden" name="id" value={product.id} />}
    <div className="admin-columns"><label>Name<input name="name" defaultValue={product?.name} required maxLength={150} /></label><label>Slug<input name="slug" defaultValue={product?.slug} required placeholder="sidr-honey-500g" pattern="[a-z0-9]+(-[a-z0-9]+)*" /></label></div>
    <div className="admin-columns"><div><label>Category<select name="categoryId" defaultValue={product?.categoryId} required><option value="">Choose a category</option>{choices.map((c) => <option key={c.id} value={c.id}>{c.name}{c.isActive ? "" : " (inactive)"}</option>)}</select></label><p className="admin-muted">Products in inactive categories are hidden. <Link href="/admin/categories">Manage categories</Link></p></div><div><input type="hidden" name="inactiveStatus" value={product?.status === "archived" ? "archived" : "draft"} /><label className="check"><input type="checkbox" name="active" value="yes" defaultChecked={product?.status === "active"} /> Active — show on the website</label><p className="admin-muted">Uncheck to hide this product from the website. Save the product to apply your changes.</p>{product?.status === "archived" && <p className="admin-muted">This product is archived. Check Active and save to restore it.</p>}</div></div>
    <div className="admin-columns"><label>Price (Rs)<input name="price" type="number" min="0.01" max="9999999" step="0.01" defaultValue={price(product?.price)} required /></label><label>Compare-at price (Rs, optional)<input name="compareAtPrice" type="number" min="0.01" max="9999999" step="0.01" defaultValue={price(product?.compareAtPrice)} /></label></div>
    <div className="admin-columns"><label>Stock quantity<input name="stock" type="number" min="0" max="1000000" defaultValue={product?.stock ?? 0} required /></label><label>Listed on<input name="listedOn" type="date" defaultValue={product?.listedOn ?? new Date().toISOString().slice(0, 10)} required /></label></div>
    <div className="admin-columns"><label>Rating<input name="rating" type="number" min="0" max="5" step="0.1" defaultValue={product?.rating ?? 0} required /></label><label>Review count<input name="reviewCount" type="number" min="0" defaultValue={product?.reviewCount ?? 0} required /></label></div>
    <label>Display order<input name="sortOrder" type="number" min="0" defaultValue={product?.sortOrder ?? 0} required /></label>
    <div className="admin-columns">{fields.map(([name, label, defaultValue]) => <label key={name}>{label}<input name={name} defaultValue={defaultValue} required /></label>)}</div>
    <label>Short summary<textarea name="summary" defaultValue={product?.summary} required /></label><label>Description<textarea name="description" defaultValue={product?.description} required /></label>
    <fieldset><legend>Tags</legend><div className="admin-actions">{productTags.map((tag) => <label key={tag} className="check"><input type="checkbox" name="tags" value={tag} defaultChecked={product?.tags.includes(tag)} />{tag}</label>)}</div></fieldset>
    <fieldset><legend>Product images</legend><p className="admin-muted">Choose from Media or upload a new image below. The first selected image is the primary image; the rest appear in the order below.</p><div className="admin-columns">{Array.from({ length: Math.min(20, Math.max(5, selectedImages.length + 1)) }, (_, i) => <ImageSelect key={i} label={`Image ${i + 1}${i === 0 ? " (primary)" : ""}`} name="imageId" defaultValue={selectedImages[i] ?? ""} emptyLabel="None" images={images.map(({ id, alt }) => ({ id, alt }))} />)}</div></fieldset>
    <div className="admin-actions"><button className="admin-button">Save product</button></div>
  </form>{product && product.status !== "archived" && <details className="admin-panel" style={{ marginTop: 16 }}><summary>Archive this product</summary><p className="admin-muted">Archiving removes it from the storefront. You can restore it by checking Active and saving.</p><form action={archiveProduct} className="admin-form"><input type="hidden" name="id" value={product.id} /><label className="check"><input type="checkbox" name="confirm" value="yes" required /> I want to archive this product</label><button className="admin-button secondary">Archive product</button></form></details>}
  {product && <details id="delete-product" open={showDelete || undefined} className="admin-panel" style={{ marginTop: 16 }}><summary>Delete this product</summary><p className="admin-muted">This permanently removes the product and its gallery assignments. Existing order details remain, but cancelled orders can no longer restore stock for this product. Linked banners will no longer reference it. Archive the product instead if you may need it later.</p><form action={deleteProduct} className="admin-form"><input type="hidden" name="id" value={product.id} /><label className="check"><input type="checkbox" name="confirm" value="yes" required /> I understand this product will be permanently deleted</label><button className="admin-button secondary">Delete product</button></form></details>}</>;
}
