import type { SiteContent } from "@/features/content/content-data";
import { SLOT_KEYS, teamMemberSlotKey } from "@/features/content/slots";
import { blogAuthor } from "./data";

/** An explicit blog portrait wins; otherwise use the same person's team portrait. */
export function blogAuthorImage(content: SiteContent) {
  return content[SLOT_KEYS.blogAuthor]?.image ?? content[teamMemberSlotKey(blogAuthor.name)]?.image ?? null;
}
