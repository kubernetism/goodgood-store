import Link from "next/link";
import { and, asc, eq, ilike, lte, or } from "drizzle-orm";
import { db } from "@/db/client";
import { categories, products } from "@/db/schema";
import { AdminHeading, AdminNotice, Pager, pageNumber } from "@/features/admin/ui";
import { ProductVisibility } from "@/features/admin/product-visibility";
import { formatPrice } from "@/lib/format";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; stock?: string; page?: string; saved?: string; error?: string }> }) {
  await requireAdmin();
  const p = await searchParams; const q = (p.q ?? "").trim().slice(0, 100); const page = pageNumber(p.page);
  const status = p.status === "active" || p.status === "draft" || p.status === "archived" ? p.status : undefined;
  const rows = await db.select({ product: products, category: categories.name, categoryActive: categories.isActive }).from(products).innerJoin(categories, eq(categories.id, products.categoryId)).where(and(q ? or(ilike(products.name, `%${q}%`), ilike(products.slug, `%${q}%`)) : undefined, status ? eq(products.status, status) : undefined, p.stock === "low" ? lte(products.stock, 5) : undefined)).orderBy(asc(products.sortOrder), asc(products.name)).limit(21).offset((page - 1) * 20);
  const query = new URLSearchParams(); if (q) query.set("q", q); if (status) query.set("status", status); if (p.stock === "low") query.set("stock", "low");
  return <><AdminHeading title="Products" description="Manage prices, stock and product details." href="/admin/products/new" action="Add product" /><AdminNotice {...p} /><div className="admin-panel" style={{ marginTop: 16 }}>
    <form action="/admin/products" className="admin-search"><input name="q" defaultValue={q} placeholder="Search products" aria-label="Search products" /><select name="status" defaultValue={status ?? ""} aria-label="Product status"><option value="">All statuses</option><option value="active">Active</option><option value="draft">Inactive</option><option value="archived">Archived (inactive)</option></select><select name="stock" defaultValue={p.stock ?? ""} aria-label="Stock filter"><option value="">All stock</option><option value="low">Low stock</option></select><button className="admin-button secondary">Search</button></form>
    <p className="admin-muted">Check Active to show a product on the website. Changes save automatically.</p>
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Product</th><th>Category</th><th>Status</th><th>Stock</th><th>Price</th><th>Actions</th></tr></thead><tbody>{rows.slice(0, 20).map(({ product, category, categoryActive }) => <tr key={product.id}><td><Link href={`/admin/products/${product.id}`}>{product.name}</Link><br /><span className="admin-muted">{product.slug}</span></td><td>{category}{!categoryActive && <><br /><span className="admin-muted">Category inactive; product hidden</span></>}</td><td><ProductVisibility key={product.status} id={product.id} name={product.name} active={product.status === "active"} archived={product.status === "archived"} /></td><td>{product.stock}</td><td>{formatPrice(product.price)}</td><td><div className="admin-actions"><Link href={`/admin/products/${product.id}`} aria-label={`Edit ${product.name}`}>Edit</Link><Link href={`/admin/products/${product.id}?delete=1#delete-product`} aria-label={`Delete ${product.name}`}>Delete</Link></div></td></tr>)}</tbody></table></div>{rows.length === 0 && <p className="admin-muted">No products found.</p>}<Pager page={page} hasNext={rows.length > 20} base={`/admin/products${query.size ? `?${query}` : ""}`} />
  </div></>;
}
