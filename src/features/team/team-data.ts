import "server-only";
import { asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db/client";
import { media, teamMembers } from "@/db/schema";
import { toImageAsset } from "@/features/products/catalog-assembly";
import type { ImageAsset } from "@/features/products/types";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { isUndefinedTable } from "@/server/db-errors";
import { teamMemberLinks, type TeamLink } from "./team-links";

export type PublicTeamMember = { id: string; name: string; role: string; bio: string; photo: ImageAsset | null; links: TeamLink[] };

/** Published team members in display order, for the About page. Cached until an admin edit. */
export async function getPublishedTeam(): Promise<PublicTeamMember[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.team);

  let rows;
  try {
    rows = await db
      .select({
        id: teamMembers.id,
        name: teamMembers.name,
        role: teamMembers.role,
        bio: teamMembers.bio,
        email: teamMembers.email,
        phone: teamMembers.phone,
        phoneOnWhatsapp: teamMembers.phoneOnWhatsapp,
        facebookUrl: teamMembers.facebookUrl,
        instagramUrl: teamMembers.instagramUrl,
        linkedinUrl: teamMembers.linkedinUrl,
        xUrl: teamMembers.xUrl,
        photoUrl: media.url,
        photoAlt: media.alt,
        photoWidth: media.width,
        photoHeight: media.height,
      })
      .from(teamMembers)
      .leftJoin(media, eq(media.id, teamMembers.photoId))
      .where(eq(teamMembers.isPublished, true))
      .orderBy(asc(teamMembers.sortOrder), asc(teamMembers.createdAt), asc(teamMembers.id))
      .limit(24);
  } catch (error) {
    // Until the team_members migration is applied the About page keeps its
    // placeholder team instead of failing. Any other error still surfaces.
    if (isUndefinedTable(error)) return [];
    throw error;
  }

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    role: row.role,
    bio: row.bio,
    photo: row.photoUrl && row.photoAlt ? toImageAsset({ url: row.photoUrl, alt: row.photoAlt, width: row.photoWidth, height: row.photoHeight }) : null,
    links: teamMemberLinks(row),
  }));
}
