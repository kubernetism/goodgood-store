import Link from "next/link";
import { and, asc, desc, eq, ilike } from "drizzle-orm";
import { db } from "@/db/client";
import { banners } from "@/db/schema";
import { AdminHeading, AdminNotice, Pager, pageNumber } from "@/features/admin/ui";
import { placementLabel } from "@/features/banners/model";
import { formatPktDateTime } from "@/lib/pk-time";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;

export default async function BannersPage({ searchParams }: { searchParams: Promise<{ page?: string; saved?: string; error?: string; q?: string; placement?: string }> }) {
  await requireAdmin(); const p = await searchParams; const page = pageNumber(p.page);
  const q = (p.q ?? "").trim().slice(0, 100);
  const placement = p.placement === "hero" || p.placement === "deal" || p.placement === "announcement" ? p.placement : undefined;
  const rows = await db.select().from(banners).where(and(q ? ilike(banners.title, `%${q}%`) : undefined, placement ? eq(banners.placement, placement) : undefined)).orderBy(asc(banners.sortOrder), desc(banners.createdAt)).limit(21).offset((page - 1) * 20);
  const query = new URLSearchParams(); if (q) query.set("q", q); if (placement) query.set("placement", placement);
  return <><AdminHeading title="Banners" description="Schedule promotions and announcements." href="/admin/banners/new" action="Add banner" /><AdminNotice {...p} /><div className="admin-panel" style={{ marginTop: 16 }}><form action="/admin/banners" className="admin-search"><input name="q" defaultValue={q} placeholder="Search banners" aria-label="Search banners" /><select name="placement" defaultValue={placement ?? ""} aria-label="Banner placement"><option value="">All placements</option><option value="hero">Home hero</option><option value="deal">Deal band</option><option value="announcement">Announcement bar</option></select><button className="admin-button secondary">Search</button></form><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Title</th><th>Placement</th><th>Active</th><th>Starts / ends</th></tr></thead><tbody>{rows.slice(0, 20).map((b) => <tr key={b.id}><td><Link href={`/admin/banners/${b.id}`}>{b.title}</Link></td><td>{placementLabel(b.placement)}</td><td>{b.isActive ? "Yes" : "No"}</td><td>{b.startsAt ? formatPktDateTime(b.startsAt) : "Any time"}<br />{b.endsAt ? formatPktDateTime(b.endsAt) : "No end"}</td></tr>)}</tbody></table></div>{!rows.length && <p className="admin-muted">No banners found. The storefront uses its default content until a banner is active.</p>}<Pager page={page} hasNext={rows.length > 20} base={`/admin/banners${query.size ? `?${query}` : ""}`} /></div></>;
}
