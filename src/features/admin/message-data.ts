import "server-only";
import { count, eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db/client";
import { contactMessages } from "@/db/schema";

/** Unread contact messages; deduplicated per request (sidebar badge and dashboard share it). */
export const countUnreadMessages = cache(async (): Promise<number> => {
  const [row] = await db.select({ value: count() }).from(contactMessages).where(eq(contactMessages.isRead, false));
  return row?.value ?? 0;
});
