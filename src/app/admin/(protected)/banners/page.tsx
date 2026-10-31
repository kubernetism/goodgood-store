import Link from "next/link";
import type { Metadata } from "next";
import { and, asc, desc, eq, ilike } from "drizzle-orm";
import { Megaphone, Pencil } from "lucide-react";
import { db } from "@/db/client";
import { banners } from "@/db/schema";
import { bannerScheduleStatus, bannerStatusDisplay } from "@/features/admin/status-display";
import { AdminTable, TBody, Td, Th, THead, Tr } from "@/features/admin/table";
import { AdminHeading, AdminNotice, EmptyState, ListFilters, Pager, pageNumber, SelectField, StatusPill } from "@/features/admin/ui";
import { placementLabel } from "@/features/banners/model";
import { formatPktDateTime } from "@/lib/pk-time";
import { containsPattern } from "@/lib/search";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;
export const metadata: Metadata = { title: "Banners" };

export default async function BannersPage({ searchParams }: { searchParams: Promise<{ page?: string; saved?: string; error?: string; q?: string; placement?: string }> }) {
  await requireAdmin();
  const p = await searchParams;
  const page = pageNumber(p.page);
  const q = (p.q ?? "").trim().slice(0, 100);
  const placement = p.placement === "hero" || p.placement === "deal" || p.placement === "announcement" ? p.placement : undefined;
  const rows = await db.select().from(banners).where(and(q ? ilike(banners.title, containsPattern(q)) : undefined, placement ? eq(banners.placement, placement) : undefined)).orderBy(asc(banners.sortOrder), desc(banners.createdAt)).limit(21).offset((page - 1) * 20);
  const query = new URLSearchParams(); if (q) query.set("q", q); if (placement) query.set("placement", placement);
  const shown = rows.slice(0, 20);
  const filtered = Boolean(q || placement);
  const now = new Date();
  return <div className="admin-page">
    <AdminHeading eyebrow="Website" title="Banners" description="Schedule promotions and announcements." href="/admin/banners/new" action="Add banner" />
    <AdminNotice {...p} />
    <section className="admin-panel" aria-label="Banners">
      <ListFilters action="/admin/banners" label="Filter banners" q={q} placeholder="Banner title" activeCount={placement ? 1 : 0} resetHref="/admin/banners">
        <SelectField label="Placement" name="placement" defaultValue={placement ?? ""} options={[{ value: "", label: "All placements" }, { value: "hero", label: "Home hero" }, { value: "deal", label: "Deal band" }, { value: "announcement", label: "Announcement bar" }]} />
      </ListFilters>
      {shown.length ? <AdminTable label="Banners">
        <THead><Th>Banner</Th><Th>Status</Th><Th>Placement</Th><Th>Window (PKT)</Th><Th><span className="sr-only">Actions</span></Th></THead>
        <TBody>{shown.map((banner) => {
          const status = bannerStatusDisplay[bannerScheduleStatus(banner, now)];
          return <Tr key={banner.id}>
            <Td slot="title"><Link href={`/admin/banners/${banner.id}`}>{banner.title}</Link></Td>
            <Td slot="badge"><StatusPill tone={status.tone} label={status.label} /></Td>
            <Td label="Placement">{placementLabel(banner.placement)}</Td>
            <Td label="Window"><span className="admin-num">{banner.startsAt ? formatPktDateTime(banner.startsAt) : "Any time"} → {banner.endsAt ? formatPktDateTime(banner.endsAt) : "No end"}</span></Td>
            <Td slot="actions"><div className="admin-row-actions"><Link className="admin-button quiet sm" href={`/admin/banners/${banner.id}`} aria-label={`Edit ${banner.title}`}><Pencil aria-hidden="true" />Edit</Link></div></Td>
          </Tr>;
        })}</TBody>
      </AdminTable> : <EmptyState icon={<Megaphone />} title={filtered ? "No banners match these filters" : "No banners yet"}
        actions={filtered ? <Link className="admin-button secondary" href="/admin/banners">Clear filters</Link> : <Link className="admin-button" href="/admin/banners/new">Add banner</Link>}>
        {filtered ? "Try a different search or placement." : "The storefront uses its default content until a banner is live."}
      </EmptyState>}
      <Pager page={page} hasNext={rows.length > 20} base={`/admin/banners${query.size ? `?${query}` : ""}`} shown={shown.length} />
    </section>
  </div>;
}
