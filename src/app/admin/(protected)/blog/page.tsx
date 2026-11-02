import Link from "next/link";
import type { Metadata } from "next";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { NotebookPen, Pencil } from "lucide-react";
import { db } from "@/db/client";
import { blogPosts } from "@/db/schema";
import { AdminTable, TBody, Td, Th, THead, Tr } from "@/features/admin/table";
import { AdminHeading, AdminNotice, EmptyState, ListFilters, Pager, pageNumber, SelectField, StatusPill } from "@/features/admin/ui";
import { blogCategories } from "@/features/blog/data";
import { EMPTY_BLOG_METRICS, formatReadingTime } from "@/features/blog/metrics";
import { getBlogMetrics } from "@/features/blog/metrics-data";
import { formatDate } from "@/lib/format";
import { containsPattern } from "@/lib/search";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;
export const metadata: Metadata = { title: "Blog" };

export default async function AdminBlog({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string; error?: string; saved?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const q = (params.q ?? "").trim().slice(0, 100);
  const page = pageNumber(params.page);
  const status = params.status === "published" || params.status === "draft" ? params.status : "";
  const rows = await db.select().from(blogPosts).where(and(q ? or(ilike(blogPosts.title, containsPattern(q)), ilike(blogPosts.slug, containsPattern(q))) : undefined, status ? eq(blogPosts.isPublished, status === "published") : undefined)).orderBy(desc(blogPosts.publishedOn), desc(blogPosts.createdAt)).limit(21).offset((page - 1) * 20);
  const shown = rows.slice(0, 20);
  const metrics = await getBlogMetrics(shown.map((post) => post.id));
  const query = new URLSearchParams(); if (q) query.set("q", q); if (status) query.set("status", status);
  const filtered = Boolean(q || status);
  return <div className="admin-page">
    <AdminHeading eyebrow="Website" title="Blog" description="Articles for the Honey Journal." href="/admin/blog/new" action="Add post" />
    <AdminNotice {...params} />
    <section className="admin-panel" aria-label="Blog posts">
      <ListFilters action="/admin/blog" label="Filter posts" q={q} placeholder="Title or slug" activeCount={status ? 1 : 0} resetHref="/admin/blog">
        <SelectField label="Status" name="status" defaultValue={status} options={[{ value: "", label: "All statuses" }, { value: "published", label: "Published" }, { value: "draft", label: "Draft" }]} />
      </ListFilters>
      {shown.length ? <>
        <p className="admin-hint">Views count visible visits lasting at least two seconds. Reading time is the average active time per view.</p>
        <AdminTable label="Blog posts">
          <THead><Th>Post</Th><Th>Status</Th><Th>Category</Th><Th>Date</Th><Th num>Views</Th><Th num>Avg. read</Th><Th num>Total read</Th><Th><span className="sr-only">Actions</span></Th></THead>
          <TBody>{shown.map((post) => {
            const stats = metrics.get(post.id) ?? EMPTY_BLOG_METRICS;
            return <Tr key={post.id}>
              <Td slot="title"><Link href={`/admin/blog/${post.id}`}>{post.title}</Link><span className="admin-cell-sub admin-ident">{post.slug}</span></Td>
              <Td slot="badge">{post.isPublished ? <StatusPill tone="positive" label="Published" /> : <StatusPill tone="neutral" label="Draft" />}</Td>
              <Td label="Category">{blogCategories.find((category) => category.slug === post.category)?.name ?? post.category}</Td>
              <Td label="Date">{formatDate(post.publishedOn)}</Td>
              <Td label="Views" num>{stats.views}</Td>
              <Td label="Avg. read" num>{formatReadingTime(stats.averageSeconds)}</Td>
              <Td label="Total read" num>{formatReadingTime(stats.totalSeconds)}</Td>
              <Td slot="actions"><div className="admin-row-actions"><Link className="admin-button quiet sm" href={`/admin/blog/${post.id}`} aria-label={`Edit ${post.title}`}><Pencil aria-hidden="true" />Edit</Link></div></Td>
            </Tr>;
          })}</TBody>
        </AdminTable>
      </> : <EmptyState icon={<NotebookPen />} title={filtered ? "No posts match these filters" : "No posts yet"}
        actions={filtered ? <Link className="admin-button secondary" href="/admin/blog">Clear filters</Link> : <Link className="admin-button" href="/admin/blog/new">Add post</Link>}>
        {filtered ? "Try a different search or status." : "Write your first article for the Honey Journal."}
      </EmptyState>}
      <Pager page={page} hasNext={rows.length > 20} base={`/admin/blog${query.size ? `?${query}` : ""}`} shown={shown.length} />
    </section>
  </div>;
}
