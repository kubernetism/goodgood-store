import Link from "next/link";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db/client";
import { blogPosts } from "@/db/schema";
import { blogCategories } from "@/features/blog/data";
import { AdminHeading, AdminNotice, Pager, pageNumber } from "@/features/admin/ui";
import { requireAdmin } from "@/server/auth/session";
import { getBlogMetrics } from "@/features/blog/metrics-data";
import { EMPTY_BLOG_METRICS, formatReadingTime } from "@/features/blog/metrics";

export const instant = false;

export default async function AdminBlog({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string; error?: string; saved?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const q = (params.q ?? "").trim().slice(0, 100);
  const page = pageNumber(params.page);
  const status = params.status === "published" || params.status === "draft" ? params.status : "";
  const rows = await db.select().from(blogPosts).where(and(q ? or(ilike(blogPosts.title, `%${q}%`), ilike(blogPosts.slug, `%${q}%`)) : undefined, status ? eq(blogPosts.isPublished, status === "published") : undefined)).orderBy(desc(blogPosts.publishedOn), desc(blogPosts.createdAt)).limit(21).offset((page - 1) * 20);
  const metrics = await getBlogMetrics(rows.slice(0, 20).map((post) => post.id));
  const query = new URLSearchParams(); if (q) query.set("q", q); if (status) query.set("status", status);
  return <><AdminHeading title="Blog" description="Write and manage articles for the Honey Journal." href="/admin/blog/new" action="Add post" /><AdminNotice {...params} /><div className="admin-panel">
    <form action="/admin/blog" className="admin-search"><input name="q" defaultValue={q} placeholder="Search posts" aria-label="Search posts" /><select name="status" defaultValue={status} aria-label="Post status"><option value="">All statuses</option><option value="published">Published</option><option value="draft">Draft</option></select><button className="admin-button secondary">Search</button></form>
    <p className="admin-muted">Views count visible visits lasting at least two seconds. Reading time is the average active time per view.</p>
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Post</th><th>Category</th><th>Status</th><th>Date</th><th>Views</th><th>Avg. reading</th><th>Total reading</th><th>Actions</th></tr></thead><tbody>{rows.slice(0, 20).map((post) => { const stats = metrics.get(post.id) ?? EMPTY_BLOG_METRICS; return <tr key={post.id}><td><Link href={`/admin/blog/${post.id}`}>{post.title}</Link><br /><span className="admin-muted">{post.slug}</span></td><td>{blogCategories.find((category) => category.slug === post.category)?.name ?? post.category}</td><td>{post.isPublished ? "Published" : "Draft"}</td><td>{post.publishedOn}</td><td>{stats.views}</td><td>{formatReadingTime(stats.averageSeconds)}</td><td>{formatReadingTime(stats.totalSeconds)}</td><td><Link href={`/admin/blog/${post.id}`} aria-label={`Edit ${post.title}`}>Edit</Link></td></tr>; })}</tbody></table></div>
    {!rows.length && <p className="admin-muted">No posts found.</p>}<Pager page={page} hasNext={rows.length > 20} base={`/admin/blog${query.size ? `?${query}` : ""}`} />
  </div></>;
}
