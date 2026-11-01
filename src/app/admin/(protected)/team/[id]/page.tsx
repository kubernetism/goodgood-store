import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { z } from "zod";
import { db } from "@/db/client";
import { media, teamMembers } from "@/db/schema";
import { toImageOptions } from "@/features/admin/image-options";
import { TeamEditor } from "@/features/admin/team-editor";
import { AdminHeading, AdminNotice, StatusPill } from "@/features/admin/ui";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;
export const metadata: Metadata = { title: "Edit team member" };

export default async function EditTeamMember({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string; delete?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [rows, images, notice] = await Promise.all([
    db.select().from(teamMembers).where(eq(teamMembers.id, id)).limit(1),
    db.select({ id: media.id, alt: media.alt, url: media.url }).from(media).orderBy(desc(media.createdAt)),
    searchParams,
  ]);
  const member = rows[0];
  if (!member) notFound();
  return <div className="admin-page">
    <AdminHeading back={{ href: "/admin/team", label: "Back to team" }} eyebrow="Website" title={member.name} description={member.role} meta={member.isPublished ? <StatusPill tone="positive" label="Published" /> : <StatusPill tone="neutral" label="Hidden" />} />
    <AdminNotice error={notice.error} saved={notice.saved} message="Team member saved." />
    <TeamEditor member={member} images={toImageOptions(images)} showDelete={notice.delete === "1"} />
  </div>;
}
