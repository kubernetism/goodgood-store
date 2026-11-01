import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { asc, eq } from "drizzle-orm";
import { Pencil, UsersRound } from "lucide-react";
import { db } from "@/db/client";
import { media, teamMembers } from "@/db/schema";
import { AdminTable, TBody, Td, Th, THead, Tr } from "@/features/admin/table";
import { moveTeamMember } from "@/features/admin/team-actions";
import { TeamMoveButtons } from "@/features/admin/team-move-buttons";
import { AdminHeading, AdminNotice, EmptyState, Notice, StatusPill } from "@/features/admin/ui";
import { requireAdmin } from "@/server/auth/session";
import { isUndefinedTable } from "@/server/db-errors";

export const instant = false;
export const metadata: Metadata = { title: "Team" };

/** Small by nature, so the whole team is one ordered list (no paging: the arrows move across it). */
const MAX_MEMBERS = 100;

async function loadTeam() {
  try {
    const rows = await db
      .select({ id: teamMembers.id, name: teamMembers.name, role: teamMembers.role, isPublished: teamMembers.isPublished, photoUrl: media.url })
      .from(teamMembers)
      .leftJoin(media, eq(media.id, teamMembers.photoId))
      .orderBy(asc(teamMembers.sortOrder), asc(teamMembers.createdAt), asc(teamMembers.id))
      .limit(MAX_MEMBERS);
    return { ready: true as const, rows };
  } catch (error) {
    if (isUndefinedTable(error)) return { ready: false as const, rows: [] };
    throw error;
  }
}

export default async function AdminTeam({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireAdmin();
  const [{ ready, rows }, params] = await Promise.all([loadTeam(), searchParams]);
  const published = rows.filter((row) => row.isPublished).length;
  return <div className="admin-page">
    <AdminHeading eyebrow="Website" title="Team" description="The people on the About page, in this order. Only published members are shown." href={ready ? "/admin/team/new" : undefined} action="Add team member" />
    <AdminNotice error={params.error} saved={params.saved} message={params.saved === "deleted" ? "Team member deleted." : undefined} />
    {!ready ? <Notice tone="info" title="Team storage is not set up yet">
      <p>The database table for team members has not been created. Ask your developer to run the pending database migration; the About page keeps its current placeholder team until then.</p>
    </Notice> : <section className="admin-panel" aria-label="Team members">
      {rows.length ? <>
        <p className="admin-muted">{published === 0 ? "No one is published yet, so the About page still shows the placeholder team." : `${published} of ${rows.length} shown on the About page.`}</p>
        <AdminTable label="Team members">
          <THead><Th>Member</Th><Th>About page</Th><Th>Order</Th><Th><span className="sr-only">Actions</span></Th></THead>
          <TBody>{rows.map((member, index) => <Tr key={member.id}>
            <Td slot="title"><div className="admin-with-thumb">
              <span className="admin-thumb">{member.photoUrl && <Image src={member.photoUrl} alt="" fill sizes="40px" />}</span>
              <div><Link href={`/admin/team/${member.id}`}>{member.name}</Link><span className="admin-cell-sub">{member.role}</span></div>
            </div></Td>
            <Td slot="badge">{member.isPublished ? <StatusPill tone="positive" label="Published" /> : <StatusPill tone="neutral" label="Hidden" />}</Td>
            <Td label="Order">
              <form action={moveTeamMember}>
                <input type="hidden" name="id" value={member.id} />
                <TeamMoveButtons name={member.name} isFirst={index === 0} isLast={index === rows.length - 1} />
              </form>
            </Td>
            <Td slot="actions"><div className="admin-row-actions">
              <Link className="admin-button quiet sm" href={`/admin/team/${member.id}`} aria-label={`Edit ${member.name}`}><Pencil aria-hidden="true" />Edit</Link>
              <Link className="admin-button danger-quiet sm" href={`/admin/team/${member.id}?delete=1#delete-member`} aria-label={`Delete ${member.name}`}>Delete…</Link>
            </div></Td>
          </Tr>)}</TBody>
        </AdminTable>
      </> : <EmptyState icon={<UsersRound />} title="No team members yet"
        actions={<Link className="admin-button" href="/admin/team/new">Add team member</Link>}>
        Add the people behind the business with a photo, role and short bio. Until you publish one, the About page shows a placeholder team.
      </EmptyState>}
    </section>}
  </div>;
}
