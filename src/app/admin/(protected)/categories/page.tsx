import Link from "next/link";
import type { Metadata } from "next";
import { asc, count, eq } from "drizzle-orm";
import { Pencil, Tags } from "lucide-react";
import { db } from "@/db/client";
import { categories, products } from "@/db/schema";
import { AdminTable, TBody, Td, Th, THead, Tr } from "@/features/admin/table";
import { AdminHeading, AdminNotice, EmptyState, StatusPill } from "@/features/admin/ui";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;
export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireAdmin();
  const [rows, notice] = await Promise.all([
    db.select({ category: categories, productCount: count(products.id) }).from(categories).leftJoin(products, eq(products.categoryId, categories.id)).groupBy(categories.id).orderBy(asc(categories.sortOrder), asc(categories.name)),
    searchParams,
  ]);
  return <div className="admin-page">
    <AdminHeading eyebrow="Catalogue" title="Categories" description="The product categories used throughout your shop." href="/admin/categories/new" action="Add category" />
    <AdminNotice {...notice} />
    <section className="admin-panel" aria-label="Categories">
      {rows.length ? <>
        <p className="admin-hint">Categories appear in the Shop menu when they are shown and contain at least one active product.</p>
        <AdminTable label="Categories">
          <THead><Th>Category</Th><Th>Status</Th><Th num>Products</Th><Th num>Order</Th><Th><span className="sr-only">Actions</span></Th></THead>
          <TBody>{rows.map(({ category, productCount }) => <Tr key={category.id}>
            <Td slot="title"><Link href={`/admin/categories/${category.id}`}>{category.name}</Link><span className="admin-cell-sub admin-mono">{category.slug}</span></Td>
            <Td slot="badge">{category.isActive ? <StatusPill tone="positive" label="Shown" /> : <StatusPill tone="neutral" label="Hidden" />}</Td>
            <Td label="Products" num>{productCount}</Td>
            <Td label="Order" num>{category.sortOrder}</Td>
            <Td slot="actions"><div className="admin-row-actions"><Link className="admin-button quiet sm" href={`/admin/categories/${category.id}`} aria-label={`Edit ${category.name}`}><Pencil aria-hidden="true" />Edit</Link></div></Td>
          </Tr>)}</TBody>
        </AdminTable>
      </> : <EmptyState icon={<Tags />} title="No categories yet" actions={<Link className="admin-button" href="/admin/categories/new">Add category</Link>}>Add a category before adding products.</EmptyState>}
    </section>
  </div>;
}
