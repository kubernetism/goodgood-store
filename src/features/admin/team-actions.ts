"use server";

import { randomUUID } from "node:crypto";
import { asc, eq, sql } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db/client";
import { teamMembers } from "@/db/schema";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { requireAdmin } from "@/server/auth/session";
import { isForeignKeyViolation } from "@/server/db-errors";
import { parseMoveDirection, planTeamMove } from "./team-order";
import { teamMemberFormSchema } from "./team-schema";

const value = (form: FormData, name: string) => String(form.get(name) ?? "");
function error(path: string, message: string): never { redirect(`${path}?error=${encodeURIComponent(message)}`); }
/** The About page reads the team through the `team` cache tag. */
function refresh() { updateTag(CACHE_TAGS.team); revalidatePath("/admin/team"); }

export async function saveTeamMember(form: FormData) {
  await requireAdmin();
  const id = value(form, "id");
  if (id && !z.uuid().safeParse(id).success) error("/admin/team", "Invalid team member.");
  const path = id ? `/admin/team/${id}` : "/admin/team/new";
  const parsed = teamMemberFormSchema.safeParse({
    ...Object.fromEntries(form.entries()),
    phoneOnWhatsapp: value(form, "phoneOnWhatsapp") === "yes",
    isPublished: value(form, "isPublished") === "yes",
  });
  if (!parsed.success) error(path, parsed.error.issues[0]?.message ?? "Check the team member details.");
  const memberId = id || randomUUID();
  let rows: { id: string }[];
  try {
    rows = id
      ? await db.update(teamMembers).set(parsed.data).where(eq(teamMembers.id, id)).returning({ id: teamMembers.id })
      // New members join the end of the list; reorder them from the Team page.
      : await db.insert(teamMembers).values({ id: memberId, ...parsed.data, sortOrder: sql`(select coalesce(max("sort_order"), -1) + 1 from "team_members")` }).returning({ id: teamMembers.id });
  } catch (cause) {
    if (isForeignKeyViolation(cause)) error(path, "That photo is no longer in Media. Choose another photo.");
    console.error("Team member save failed", cause);
    error(path, "Could not save the team member. Please try again.");
  }
  if (!rows.length) error("/admin/team", "Team member not found.");
  refresh();
  redirect(`/admin/team/${memberId}?saved=1`);
}

export async function deleteTeamMember(form: FormData) {
  await requireAdmin();
  const id = value(form, "id");
  if (!z.uuid().safeParse(id).success) error("/admin/team", "Invalid team member.");
  const path = `/admin/team/${id}`;
  if (value(form, "confirm") !== "yes") error(path, "Confirm the deletion first.");
  let rows: { id: string }[];
  try { rows = await db.delete(teamMembers).where(eq(teamMembers.id, id)).returning({ id: teamMembers.id }); }
  catch (cause) { console.error("Team member deletion failed", cause); error(path, "Could not delete the team member. Please try again."); }
  if (!rows.length) error("/admin/team", "Team member not found.");
  refresh();
  redirect("/admin/team?saved=deleted");
}

/** Up/down buttons on the Team list. No redirect on success, so the list re-renders in place. */
export async function moveTeamMember(form: FormData) {
  await requireAdmin();
  const id = value(form, "id");
  const direction = parseMoveDirection(value(form, "direction"));
  if (!z.uuid().safeParse(id).success || !direction) error("/admin/team", "Invalid move.");
  try {
    const rows = await db.select({ id: teamMembers.id, sortOrder: teamMembers.sortOrder }).from(teamMembers)
      .orderBy(asc(teamMembers.sortOrder), asc(teamMembers.createdAt), asc(teamMembers.id));
    const [first, ...rest] = planTeamMove(rows, id, direction).map((row) =>
      db.update(teamMembers).set({ sortOrder: row.sortOrder }).where(eq(teamMembers.id, row.id)));
    if (!first) return;
    await db.batch([first, ...rest]);
  } catch (cause) {
    console.error("Team reorder failed", cause);
    error("/admin/team", "Could not change the order. Please try again.");
  }
  refresh();
}
