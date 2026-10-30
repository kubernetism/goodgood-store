import Link from "next/link";
import { and, asc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db/client";
import { testimonials } from "@/db/schema";
import { AdminHeading, AdminNotice, Pager, pageNumber } from "@/features/admin/ui";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;

export default async function AdminTestimonials({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string; error?: string; saved?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const q = (params.q ?? "").trim().slice(0, 100);
  const page = pageNumber(params.page);
  const status = params.status === "active" || params.status === "hidden" ? params.status : "";
  const rows = await db.select().from(testimonials).where(and(q ? or(ilike(testimonials.name, `%${q}%`), ilike(testimonials.quote, `%${q}%`)) : undefined, status ? eq(testimonials.isActive, status === "active") : undefined)).orderBy(asc(testimonials.sortOrder), asc(testimonials.createdAt)).limit(21).offset((page - 1) * 20);
  const query = new URLSearchParams(); if (q) query.set("q", q); if (status) query.set("status", status);
  return <><AdminHeading title="Testimonials" description="The website shows the first 10 active testimonials, ordered by display order and then oldest first." href="/admin/testimonials/new" action="Add testimonial" /><AdminNotice {...params} /><div className="admin-panel">
    <form action="/admin/testimonials" className="admin-search"><input name="q" defaultValue={q} placeholder="Search testimonials" aria-label="Search testimonials" /><select name="status" defaultValue={status} aria-label="Testimonial status"><option value="">All statuses</option><option value="active">Active</option><option value="hidden">Hidden</option></select><button className="admin-button secondary">Search</button></form>
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Customer</th><th>Testimonial</th><th>Rating</th><th>Status</th><th>Order</th><th>Actions</th></tr></thead><tbody>{rows.slice(0, 20).map((item) => <tr key={item.id}><td><Link href={`/admin/testimonials/${item.id}`}>{item.name}</Link>{item.role && <><br /><span className="admin-muted">{item.role}</span></>}</td><td>{item.quote.length > 100 ? `${item.quote.slice(0, 100)}…` : item.quote}</td><td>{item.rating} / 5</td><td>{item.isActive ? "Active" : "Hidden"}</td><td>{item.sortOrder}</td><td><div className="admin-actions"><Link href={`/admin/testimonials/${item.id}`} aria-label={`Edit testimonial from ${item.name}`}>Edit</Link><Link href={`/admin/testimonials/${item.id}?delete=1#delete-testimonial`} aria-label={`Delete testimonial from ${item.name}`}>Delete</Link></div></td></tr>)}</tbody></table></div>
    {!rows.length && <p className="admin-muted">No testimonials found.</p>}<Pager page={page} hasNext={rows.length > 20} base={`/admin/testimonials${query.size ? `?${query}` : ""}`} />
  </div></>;
}
