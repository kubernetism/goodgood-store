import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { MailOpen, MessageCircle, Phone, Reply } from "lucide-react";
import { z } from "zod";
import { db } from "@/db/client";
import { contactMessages } from "@/db/schema";
import { telHref, waLink } from "@/features/admin/contact-links";
import { MarkMessageRead } from "@/features/admin/mark-message-read";
import { deleteMessage, setMessageRead } from "@/features/admin/message-actions";
import { firstParam, type RawSearchParams } from "@/features/admin/search-params";
import { SubmitButton } from "@/features/admin/submit-button";
import { AdminHeading, AdminNotice, DangerZone, StatusPill } from "@/features/admin/ui";
import { formatPakistaniMobile } from "@/features/checkout/validation";
import { contactServices } from "@/features/contact/validation";
import { formatPktDateTime } from "@/lib/pk-time";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;
// Static: metadata must not read message data outside the page's auth check.
export const metadata: Metadata = { title: "Message" };

export default async function MessagePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<RawSearchParams> }) {
  await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [message] = await db.select().from(contactMessages).where(eq(contactMessages.id, id)).limit(1);
  if (!message) notFound();
  const notice = await searchParams;
  const service = contactServices.find((option) => option.value === message.service)?.label ?? message.service;
  const tel = message.phone ? telHref(message.phone) : null;
  const whatsapp = message.phone ? waLink(message.phone) : null;
  return <div className="admin-page">
    <AdminHeading
      back={{ href: "/admin/messages", label: "Back to messages" }}
      eyebrow="Message"
      title={`Message from ${message.name}`}
      meta={<>{message.isRead ? <StatusPill tone="neutral" label="Read" /> : <StatusPill tone="pending" label="Unread" glyph={{ level: 0 }} />}<span className="admin-muted">Received {formatPktDateTime(message.createdAt)} PKT</span></>}
    />
    <AdminNotice error={firstParam(notice.error)} saved={firstParam(notice.saved)} message="Message marked as read." />
    {!message.isRead && <MarkMessageRead id={id} />}
    <section className="admin-panel admin-stack" aria-labelledby="message-title">
      <h2 id="message-title">{service}</h2>
      <p className="admin-message-body">{message.message}</p>
      <div className="admin-actions">
        <a className="admin-button" href={`mailto:${encodeURIComponent(message.email)}`}><Reply aria-hidden="true" />Reply by email</a>
        {tel && <a className="admin-button secondary" href={tel}><Phone aria-hidden="true" />Call</a>}
        {whatsapp && <a className="admin-button secondary" href={whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden="true" />WhatsApp<span className="sr-only"> (opens WhatsApp)</span></a>}
      </div>
    </section>
    <section className="admin-panel" aria-labelledby="details-title">
      <div className="admin-panel-head"><h2 id="details-title">Details</h2></div>
      <dl className="admin-dl">
        <div><dt>Name</dt><dd>{message.name}</dd></div>
        <div><dt>Email</dt><dd><a href={`mailto:${encodeURIComponent(message.email)}`}>{message.email}</a></dd></div>
        <div><dt>Service</dt><dd>{service}</dd></div>
        <div><dt>Mobile number</dt><dd>{message.phone && tel ? <a href={tel} className="admin-mono">{formatPakistaniMobile(message.phone)}</a> : "Not provided"}</dd></div>
        <div><dt>Consent</dt><dd>{message.consent ? "Agreed to the privacy policy and being contacted" : "Not recorded"}</dd></div>
        <div><dt>Received</dt><dd>{formatPktDateTime(message.createdAt)} PKT</dd></div>
      </dl>
      <form action={setMessageRead} className="admin-panel-foot">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="read" value={message.isRead ? "no" : "yes"} />
        <SubmitButton variant="quiet" pendingLabel="Updating…"><MailOpen aria-hidden="true" />Mark as {message.isRead ? "unread" : "read"}</SubmitButton>
      </form>
    </section>
    <DangerZone summary="Delete this message">
      <p>This permanently deletes the enquiry. This cannot be undone.</p>
      <form action={deleteMessage} className="admin-form">
        <input type="hidden" name="id" value={id} />
        <label className="check"><input type="checkbox" name="confirm" value="yes" required /> I understand this message will be permanently deleted</label>
        <div><SubmitButton variant="danger" pendingLabel="Deleting…">Delete message</SubmitButton></div>
      </form>
    </DangerZone>
  </div>;
}
