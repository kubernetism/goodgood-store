import Link from "next/link";
import { asc, count, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { categories, products } from "@/db/schema";
import { AdminHeading, AdminNotice } from "@/features/admin/ui";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireAdmin();
  const [rows, notice] = await Promise.all([
    db.select({ category: categories, productCount: count(products.id) }).from(categories).leftJoin(products, eq(products.categoryId, categories.id)).groupBy(categories.id).orderBy(asc(categories.sortOrder), asc(categories.name)),
    searchParams,
  ]);
  return <><AdminHeading title="Categories" description="Manage the product categories used throughout your shop." href="/admin/categories/new" action="Add category" /><AdminNotice {...notice} />
    <div className="admin-panel"><p className="admin-muted">Categories appear in the Shop menu when they are active and contain at least one active product.</p><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Category</th><th>Status</th><th>Products</th><th>Order</th><th>Actions</th></tr></thead><tbody>{rows.map(({ category, productCount }) => <tr key={category.id}><td><Link href={`/admin/categories/${category.id}`}>{category.name}</Link><br /><span className="admin-muted">{category.slug}</span></td><td>{category.isActive ? "Active" : "Inactive"}</td><td>{productCount}</td><td>{category.sortOrder}</td><td><Link href={`/admin/categories/${category.id}`} aria-label={`Edit ${category.name}`}>Edit</Link></td></tr>)}</tbody></table></div>{!rows.length && <p className="admin-muted">No categories yet. Add a category before adding products.</p>}</div>
  </>;
}
