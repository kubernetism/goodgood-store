import Link from "next/link";
import type { Metadata } from "next";
import { and, count, desc, eq, ilike, isNull } from "drizzle-orm";
import { Download, MailPlus } from "lucide-react";
import { z } from "zod";
import { db } from "@/db/client";
import { newsletterSubscribers } from "@/db/schema";
import { firstParam, type RawSearchParams } from "@/features/admin/search-params";
import { deleteSubscriber } from "@/features/admin/subscriber-actions";
import { SubmitButton } from "@/features/admin/submit-button";
import { AdminTable, TBody, Td, Th, THead, Tr } from "@/features/admin/table";
import { AdminHeading, AdminNotice, EmptyState, ListFilters, Pager, pageNumber } from "@/features/admin/ui";
import { newsletterSourceLabel } from "@/features/newsletter/sources";
import { formatPktDateTime } from "@/lib/pk-time";
import { formatRelativeAge } from "@/lib/relative-time";
import { containsPattern } from "@/lib/search";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;
export const metadata: Metadata = { title: "Subscribers" };

const PAGE_SIZE = 20;
const numberFormat = new Intl.NumberFormat("en-US");

export default async function SubscribersPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  await requireAdmin();
  const params = await searchParams;
  const q = (firstParam(params.q) ?? "").trim().slice(0, 100);
  const page = pageNumber(firstParam(params.page));
  const removeParam = firstParam(params.remove);
  const removeId = removeParam && z.uuid().safeParse(removeParam).success ? removeParam : null;
  const active = isNull(newsletterSubscribers.unsubscribedAt);
  const where = and(active, q ? ilike(newsletterSubscribers.email, containsPattern(q.toLowerCase())) : undefined);
  const now = new Date();
  const [rows, [total], [matching], [removing]] = await Promise.all([
    db.select().from(newsletterSubscribers).where(where).orderBy(desc(newsletterSubscribers.createdAt), desc(newsletterSubscribers.id)).limit(PAGE_SIZE + 1).offset((page - 1) * PAGE_SIZE),
    db.select({ value: count() }).from(newsletterSubscribers).where(active),
    q ? db.select({ value: count() }).from(newsletterSubscribers).where(where) : Promise.resolve([undefined]),
    removeId ? db.select({ id: newsletterSubscribers.id, email: newsletterSubscribers.email }).from(newsletterSubscribers).where(eq(newsletterSubscribers.id, removeId)).limit(1) : Promise.resolve([undefined]),
  ]);
  const shown = rows.slice(0, PAGE_SIZE);
  const totalCount = total?.value ?? 0;
  const query = new URLSearchParams();
  if (q) query.set("q", q);
  const listHref = `/admin/subscribers${query.size ? `?${query}` : ""}`;
  const removeHref = (id: string) => {
    const next = new URLSearchParams(query);
    if (page > 1) next.set("page", String(page));
    next.set("remove", id);
    return `/admin/subscribers?${next}#remove-subscriber`;
  };

  return <div className="admin-page">
    <AdminHeading
      eyebrow="Website"
      title="Subscribers"
      description="People who joined The Hive Letter from the site footer or the About page."
      meta={<span className="admin-muted">{totalCount === 1 ? "1 subscriber" : `${numberFormat.format(totalCount)} subscribers`}</span>}
      actions={totalCount > 0 ? <a className="admin-button secondary" href="/admin/subscribers/export" download><Download aria-hidden="true" />Export CSV</a> : undefined}
    />
    <AdminNotice error={firstParam(params.error)} saved={firstParam(params.deleted)} message="Subscriber removed." clear="saved,error,deleted" />

    {removing && <section id="remove-subscriber" className="admin-panel admin-confirm-panel" aria-labelledby="remove-title">
      <h2 id="remove-title">Remove {removing.email}?</h2>
      <p className="admin-hint">Use this for unsubscribe or data-deletion requests. The address is deleted permanently; they can sign up again later.</p>
      <form action={deleteSubscriber} className="admin-form">
        <input type="hidden" name="id" value={removing.id} />
        <label className="check"><input type="checkbox" name="confirm" value="yes" required /> Permanently remove this subscriber</label>
        <div className="admin-actions">
          <SubmitButton variant="danger" pendingLabel="Removing…">Remove subscriber</SubmitButton>
          <Link className="admin-button quiet" href={listHref}>Keep</Link>
        </div>
      </form>
    </section>}

    <section className="admin-panel" aria-label="Subscribers">
      <ListFilters action="/admin/subscribers" label="Search subscribers" q={q} placeholder="Email address" resetHref="/admin/subscribers" />
      {q && <p className="admin-muted" role="status">{matching?.value === 1 ? "1 subscriber matches" : `${numberFormat.format(matching?.value ?? 0)} subscribers match`} “{q}”.</p>}
      {shown.length > 0 ? <AdminTable label="Subscribers">
        <THead><Th>Email</Th><Th>Joined</Th><Th>Signed up from</Th><Th><span className="sr-only">Actions</span></Th></THead>
        <TBody>{shown.map((subscriber) => <Tr key={subscriber.id}>
          <Td slot="title"><span className="admin-row-title admin-break">{subscriber.email}</span></Td>
          <Td label="Joined"><span title={`${formatPktDateTime(subscriber.createdAt)} PKT`}>{formatRelativeAge(subscriber.createdAt, now)}</span><span className="admin-cell-sub">{formatPktDateTime(subscriber.createdAt)}</span></Td>
          <Td label="Signed up from">{newsletterSourceLabel(subscriber.source)}</Td>
          <Td slot="actions"><div className="admin-row-actions"><Link className="admin-button quiet sm" href={removeHref(subscriber.id)} aria-label={`Remove ${subscriber.email}`}>Remove</Link></div></Td>
        </Tr>)}</TBody>
      </AdminTable> : <EmptyState icon={<MailPlus />} title={q ? "No subscribers match this search" : "No subscribers yet"}
        actions={q ? <Link className="admin-button secondary" href="/admin/subscribers">Clear search</Link> : undefined}>
        {q ? "Try part of the address, such as the name before the @." : "Sign-ups from the newsletter forms in the footer and on the About page appear here."}
      </EmptyState>}
      <Pager page={page} hasNext={rows.length > PAGE_SIZE} base={listHref} shown={shown.length} />
    </section>
  </div>;
}
