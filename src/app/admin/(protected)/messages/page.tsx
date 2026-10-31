import Link from "next/link";
import type { Metadata } from "next";
import { and, desc, eq, ilike, lt, or } from "drizzle-orm";
import { Inbox } from "lucide-react";
import { db } from "@/db/client";
import { contactMessages } from "@/db/schema";
import { MESSAGE_RETENTION_MONTHS, messageFilterQuery, parseMessageFilters, retentionCutoff } from "@/features/admin/message-filters";
import { firstParam, type RawSearchParams } from "@/features/admin/search-params";
import { AdminTable, TBody, Td, Th, THead, Tr } from "@/features/admin/table";
import { AdminHeading, AdminNotice, EmptyState, ListFilters, Notice, Pager, SelectField, StatusPill } from "@/features/admin/ui";
import { contactServices } from "@/features/contact/validation";
import { formatPktDateTime } from "@/lib/pk-time";
import { formatRelativeAge } from "@/lib/relative-time";
import { containsPattern } from "@/lib/search";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;
export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  await requireAdmin();
  const params = await searchParams;
  const filters = parseMessageFilters(params);
  const { q, status, age, page } = filters;
  const now = new Date();
  const cutoff = retentionCutoff(now);
  const rows = await db.select().from(contactMessages).where(and(
    q ? or(ilike(contactMessages.name, containsPattern(q)), ilike(contactMessages.email, containsPattern(q)), ilike(contactMessages.message, containsPattern(q))) : undefined,
    status ? eq(contactMessages.isRead, status === "read") : undefined,
    age === "retention" ? lt(contactMessages.createdAt, cutoff) : undefined,
  )).orderBy(desc(contactMessages.createdAt), desc(contactMessages.id)).limit(21).offset((page - 1) * 20);
  const query = messageFilterQuery(filters);
  const shown = rows.slice(0, 20);
  const filtered = Boolean(q || status || age);
  const deleted = firstParam(params.deleted);
  const unread = firstParam(params.unread);

  return <div className="admin-page">
    <AdminHeading eyebrow="Today" title="Messages" description="Enquiries submitted through the contact form." />
    <AdminNotice error={firstParam(params.error)} saved={deleted || unread} message={deleted ? "Message deleted." : "Message marked as unread."} clear="saved,error,deleted,unread" />
    <section className="admin-panel" aria-label="Messages">
      <ListFilters action="/admin/messages" label="Filter messages" q={q} placeholder="Name, email or message" activeCount={(status ? 1 : 0) + (age ? 1 : 0)} resetHref="/admin/messages">
        <SelectField label="Status" name="status" defaultValue={status} options={[{ value: "", label: "All messages" }, { value: "unread", label: "Unread" }, { value: "read", label: "Read" }]} />
        <SelectField label="Age" name="age" defaultValue={age} options={[{ value: "", label: "Any age" }, { value: "retention", label: `Older than ${MESSAGE_RETENTION_MONTHS} months` }]} />
      </ListFilters>
      {age === "retention" && <div className="admin-stack-sm"><Notice title={`${shown.length}${rows.length > 20 ? "+" : ""} ${shown.length === 1 ? "message is" : "messages are"} past the retention period`}>Showing messages received before {formatPktDateTime(cutoff)} PKT. The privacy policy deletes contact messages after {MESSAGE_RETENTION_MONTHS} months unless they relate to an open issue: open each one, check it, then delete it.</Notice></div>}
      {shown.length > 0 ? <AdminTable label="Messages">
        <THead><Th>Sender</Th><Th>Received</Th><Th>Service</Th><Th>Message</Th><Th>Status</Th><Th><span className="sr-only">Actions</span></Th></THead>
        <TBody>{shown.map((message) => <Tr key={message.id}>
          <Td slot="title">
            <Link href={`/admin/messages/${message.id}`}>{!message.isRead && <span className="admin-unread-dot" aria-hidden="true" />}{message.name}</Link>
            <span className="admin-cell-sub">{message.email}</span>
          </Td>
          <Td label="Received"><span title={`${formatPktDateTime(message.createdAt)} PKT`}>{formatRelativeAge(message.createdAt, now)}</span></Td>
          <Td label="Service">{contactServices.find((service) => service.value === message.service)?.label ?? message.service}</Td>
          <Td label="Message"><span className="admin-clamp">{message.message}</span></Td>
          <Td slot="badge">{message.isRead ? <StatusPill tone="neutral" label="Read" /> : <StatusPill tone="pending" label="Unread" glyph={{ level: 0 }} />}</Td>
          <Td slot="actions"><div className="admin-row-actions"><Link className="admin-button secondary sm" href={`/admin/messages/${message.id}`} aria-label={`Open message from ${message.name}`}>Open</Link></div></Td>
        </Tr>)}</TBody>
      </AdminTable> : <EmptyState icon={<Inbox />} title={filtered ? "No messages match these filters" : "No messages yet"}
        actions={filtered ? <Link className="admin-button secondary" href="/admin/messages">Clear filters</Link> : undefined}>
        {filtered ? "Try a different search or filter." : "Enquiries from the contact form will appear here."}
      </EmptyState>}
      <Pager page={page} hasNext={rows.length > 20} base={`/admin/messages${query.size ? `?${query}` : ""}`} shown={shown.length} />
    </section>
  </div>;
}
