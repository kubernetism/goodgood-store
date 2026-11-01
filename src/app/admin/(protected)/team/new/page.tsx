import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { db } from "@/db/client";
import { media } from "@/db/schema";
import { toImageOptions } from "@/features/admin/image-options";
import { TeamEditor } from "@/features/admin/team-editor";
import { AdminHeading, AdminNotice } from "@/features/admin/ui";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;
export const metadata: Metadata = { title: "Add team member" };

export default async function NewTeamMember({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireAdmin();
  const [images, notice] = await Promise.all([
    db.select({ id: media.id, alt: media.alt, url: media.url }).from(media).orderBy(desc(media.createdAt)),
    searchParams,
  ]);
  return <div className="admin-page">
    <AdminHeading back={{ href: "/admin/team", label: "Back to team" }} eyebrow="Website" title="Add team member" description="Their photo, role and how people can reach them." />
    <AdminNotice {...notice} />
    <TeamEditor images={toImageOptions(images)} />
  </div>;
}
