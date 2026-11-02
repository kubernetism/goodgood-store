import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { and, asc, eq, ilike, lte, or } from "drizzle-orm";
import { Package, Pencil } from "lucide-react";
import { db } from "@/db/client";
import { categories, media, productImages, products } from "@/db/schema";
import { ProductVisibility } from "@/features/admin/product-visibility";
import { LOW_STOCK_THRESHOLD, stockLevel } from "@/features/admin/status-display";
import { AdminTable, TBody, Td, Th, THead, Tr } from "@/features/admin/table";
import { AdminHeading, AdminNotice, EmptyState, ListFilters, Pager, pageNumber, SelectField, StatusPill } from "@/features/admin/ui";
import { formatPrice } from "@/lib/format";
import { containsPattern } from "@/lib/search";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;
export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; stock?: string; page?: string; saved?: string; error?: string }> }) {
  await requireAdmin();
  const p = await searchParams;
  const q = (p.q ?? "").trim().slice(0, 100);
  const page = pageNumber(p.page);
  const status = p.status === "active" || p.status === "draft" || p.status === "archived" ? p.status : undefined;
  const lowStock = p.stock === "low";
  const rows = await db
    .select({ product: products, category: categories.name, categoryActive: categories.isActive, imageUrl: media.url, imageAlt: media.alt })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .leftJoin(productImages, and(eq(productImages.productId, products.id), eq(productImages.position, 0)))
    .leftJoin(media, eq(media.id, productImages.mediaId))
    .where(and(q ? or(ilike(products.name, containsPattern(q)), ilike(products.slug, containsPattern(q))) : undefined, status ? eq(products.status, status) : undefined, lowStock ? lte(products.stock, LOW_STOCK_THRESHOLD) : undefined))
    .orderBy(asc(products.sortOrder), asc(products.name))
    .limit(21)
    .offset((page - 1) * 20);
  const query = new URLSearchParams(); if (q) query.set("q", q); if (status) query.set("status", status); if (lowStock) query.set("stock", "low");
  const shown = rows.slice(0, 20);
  const filtered = Boolean(q || status || lowStock);

  return <div className="admin-page">
    <AdminHeading eyebrow="Catalogue" title="Products" description="Manage prices, stock and product details." href="/admin/products/new" action="Add product" />
    <AdminNotice {...p} />
    <section className="admin-panel" aria-label="Products">
      <ListFilters action="/admin/products" label="Filter products" q={q} placeholder="Name or slug" activeCount={(status ? 1 : 0) + (lowStock ? 1 : 0)} resetHref="/admin/products">
        <SelectField label="Status" name="status" defaultValue={status ?? ""} options={[{ value: "", label: "All statuses" }, { value: "active", label: "Shown on website" }, { value: "draft", label: "Hidden" }, { value: "archived", label: "Archived" }]} />
        <SelectField label="Stock" name="stock" defaultValue={lowStock ? "low" : ""} options={[{ value: "", label: "All stock" }, { value: "low", label: `Low stock (${LOW_STOCK_THRESHOLD} or fewer)` }]} />
      </ListFilters>
      {shown.length > 0 ? <>
        <p className="admin-hint">The website switch saves immediately. Products in a hidden category stay hidden.</p>
        <AdminTable label="Products">
          <THead><Th>Product</Th><Th>Category</Th><Th>Website</Th><Th num>Stock</Th><Th num>Price</Th><Th><span className="sr-only">Actions</span></Th></THead>
          <TBody>{shown.map(({ product, category, categoryActive, imageUrl, imageAlt }) => {
            const level = stockLevel(product.stock);
            return <Tr key={product.id}>
              <Td slot="title"><div className="admin-with-thumb">
                <span className="admin-thumb">{imageUrl && <Image src={imageUrl} alt={imageAlt ?? ""} fill sizes="40px" />}</span>
                <div><Link href={`/admin/products/${product.id}`}>{product.name}</Link><span className="admin-cell-sub admin-ident">{product.slug}</span></div>
              </div></Td>
              <Td label="Category">{category}{!categoryActive && <> <StatusPill tone="attention" label="Category hidden" /></>}</Td>
              <Td label="Website"><ProductVisibility id={product.id} name={product.name} active={product.status === "active"} archived={product.status === "archived"} /></Td>
              <Td label="Stock" num className="admin-card-inline">
                <span className={level === "out" ? "admin-field-error" : undefined}>{product.stock}</span>
                {level === "out" && <> <StatusPill tone="danger" label="Out" /></>}{level === "low" && <> <StatusPill tone="attention" label="Low" /></>}
              </Td>
              <Td label="Price" num>{formatPrice(product.price)}</Td>
              <Td slot="actions"><div className="admin-row-actions">
                <Link className="admin-button quiet sm" href={`/admin/products/${product.id}`} aria-label={`Edit ${product.name}`}><Pencil aria-hidden="true" />Edit</Link>
                <Link className="admin-button danger-quiet sm" href={`/admin/products/${product.id}?delete=1#delete-product`} aria-label={`Delete ${product.name}`}>Delete…</Link>
              </div></Td>
            </Tr>;
          })}</TBody>
        </AdminTable>
      </> : <EmptyState icon={<Package />} title={filtered ? "No products match these filters" : "No products yet"}
        actions={filtered ? <Link className="admin-button secondary" href="/admin/products">Clear filters</Link> : <Link className="admin-button" href="/admin/products/new">Add product</Link>}>
        {filtered ? "Try a different search, status or stock filter." : "Add your first honey to start selling."}
      </EmptyState>}
      <Pager page={page} hasNext={rows.length > 20} base={`/admin/products${query.size ? `?${query}` : ""}`} shown={shown.length} />
    </section>
  </div>;
}
