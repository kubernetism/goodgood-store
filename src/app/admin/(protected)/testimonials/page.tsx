import Link from "next/link";
import type { Metadata } from "next";
import { and, asc, eq, ilike, or } from "drizzle-orm";
import { Pencil, Quote, Star } from "lucide-react";
import { db } from "@/db/client";
import { testimonials } from "@/db/schema";
import { AdminTable, TBody, Td, Th, THead, Tr } from "@/features/admin/table";
import { AdminHeading, AdminNotice, EmptyState, ListFilters, Pager, pageNumber, SelectField, StatusPill } from "@/features/admin/ui";
import { containsPattern } from "@/lib/search";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;
export const metadata: Metadata = { title: "Testimonials" };

export default async function AdminTestimonials({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string; error?: string; saved?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const q = (params.q ?? "").trim().slice(0, 100);
  const page = pageNumber(params.page);
  const status = params.status === "active" || params.status === "hidden" ? params.status : "";
  const rows = await db.select().from(testimonials).where(and(q ? or(ilike(testimonials.name, containsPattern(q)), ilike(testimonials.quote, containsPattern(q))) : undefined, status ? eq(testimonials.isActive, status === "active") : undefined)).orderBy(asc(testimonials.sortOrder), asc(testimonials.createdAt)).limit(21).offset((page - 1) * 20);
  const query = new URLSearchParams(); if (q) query.set("q", q); if (status) query.set("status", status);
  const shown = rows.slice(0, 20);
  const filtered = Boolean(q || status);
  return <div className="admin-page">
    <AdminHeading eyebrow="Website" title="Testimonials" description="The website shows the first 10 visible testimonials, by display order and then oldest first." href="/admin/testimonials/new" action="Add testimonial" />
    <AdminNotice {...params} />
    <section className="admin-panel" aria-label="Testimonials">
      <ListFilters action="/admin/testimonials" label="Filter testimonials" q={q} placeholder="Customer or words" activeCount={status ? 1 : 0} resetHref="/admin/testimonials">
        <SelectField label="Status" name="status" defaultValue={status} options={[{ value: "", label: "All statuses" }, { value: "active", label: "Visible" }, { value: "hidden", label: "Hidden" }]} />
      </ListFilters>
      {shown.length ? <AdminTable label="Testimonials">
        <THead><Th>Customer</Th><Th>Status</Th><Th>Testimonial</Th><Th num>Rating</Th><Th num>Order</Th><Th><span className="sr-only">Actions</span></Th></THead>
        <TBody>{shown.map((item) => <Tr key={item.id}>
          <Td slot="title"><Link href={`/admin/testimonials/${item.id}`}>{item.name}</Link>{item.role && <span className="admin-cell-sub">{item.role}</span>}</Td>
          <Td slot="badge">{item.isActive ? <StatusPill tone="positive" label="Visible" /> : <StatusPill tone="neutral" label="Hidden" />}</Td>
          <Td label="Testimonial"><span className="admin-clamp">{item.quote}</span></Td>
          <Td label="Rating" num><Star aria-hidden="true" width={14} height={14} className="admin-inline-icon" />{item.rating} / 5</Td>
          <Td label="Order" num>{item.sortOrder}</Td>
          <Td slot="actions"><div className="admin-row-actions">
            <Link className="admin-button quiet sm" href={`/admin/testimonials/${item.id}`} aria-label={`Edit testimonial from ${item.name}`}><Pencil aria-hidden="true" />Edit</Link>
            <Link className="admin-button danger-quiet sm" href={`/admin/testimonials/${item.id}?delete=1#delete-testimonial`} aria-label={`Delete testimonial from ${item.name}`}>Delete…</Link>
          </div></Td>
        </Tr>)}</TBody>
      </AdminTable> : <EmptyState icon={<Quote />} title={filtered ? "No testimonials match these filters" : "No testimonials yet"}
        actions={filtered ? <Link className="admin-button secondary" href="/admin/testimonials">Clear filters</Link> : <Link className="admin-button" href="/admin/testimonials/new">Add testimonial</Link>}>
        {filtered ? "Try a different search or status." : "Add real customer feedback, with their permission."}
      </EmptyState>}
      <Pager page={page} hasNext={rows.length > 20} base={`/admin/testimonials${query.size ? `?${query}` : ""}`} shown={shown.length} />
    </section>
  </div>;
}
