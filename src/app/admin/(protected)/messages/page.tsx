import Link from "next/link";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db/client";
import { contactMessages } from "@/db/schema";
import { AdminHeading, AdminNotice, Pager, pageNumber } from "@/features/admin/ui";
import { contactServices } from "@/features/contact/validation";
import { formatPktDateTime } from "@/lib/pk-time";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string; error?: string; deleted?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const q = (params.q ?? "").trim().slice(0, 100);
  const status = params.status === "read" || params.status === "unread" ? params.status : "";
  const page = pageNumber(params.page);
  const rows = await db.select().from(contactMessages).where(and(
    q ? or(ilike(contactMessages.name, `%${q}%`), ilike(contactMessages.email, `%${q}%`), ilike(contactMessages.message, `%${q}%`)) : undefined,
    status ? eq(contactMessages.isRead, status === "read") : undefined,
  )).orderBy(desc(contactMessages.createdAt), desc(contactMessages.id)).limit(21).offset((page - 1) * 20);
  const query = new URLSearchParams();
  if (q) query.set("q", q);
  if (status) query.set("status", status);

  return <>
    <AdminHeading title="Messages" description="Review enquiries submitted through the contact form." />
    <AdminNotice error={params.error} />
    {params.deleted && <p className="admin-message" role="status">Message deleted.</p>}
    <div className="admin-panel">
      <form action="/admin/messages" className="admin-search">
        <input name="q" defaultValue={q} placeholder="Search name, email or message" aria-label="Search messages" />
        <select name="status" defaultValue={status} aria-label="Message status"><option value="">All messages</option><option value="unread">Unread</option><option value="read">Read</option></select>
        <button className="admin-button secondary">Search</button>
      </form>
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Received (PKT)</th><th>Sender</th><th>Service</th><th>Message</th><th>Status</th><th>Action</th></tr></thead><tbody>
        {rows.slice(0, 20).map((message) => <tr key={message.id}>
          <td>{formatPktDateTime(message.createdAt)}</td>
          <td><Link href={`/admin/messages/${message.id}`}>{message.name}</Link><br /><span className="admin-muted">{message.email}</span></td>
          <td>{contactServices.find((service) => service.value === message.service)?.label ?? message.service}</td>
          <td className="admin-message-preview">{message.message.length > 100 ? `${message.message.slice(0, 100)}…` : message.message}</td>
          <td>{message.isRead ? "Read" : <strong>Unread</strong>}</td>
          <td><Link href={`/admin/messages/${message.id}`}>View message</Link></td>
        </tr>)}
      </tbody></table></div>
      {!rows.length && <p className="admin-muted">No messages found.</p>}
      <Pager page={page} hasNext={rows.length > 20} base={`/admin/messages${query.size ? `?${query}` : ""}`} />
    </div>
  </>;
}
