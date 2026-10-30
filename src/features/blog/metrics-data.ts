import "server-only";
import { count, inArray, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { blogVisits } from "@/db/schema";
import type { BlogMetrics } from "./metrics";

export async function getBlogMetrics(ids: string[]): Promise<Map<string, BlogMetrics>> {
  if (!ids.length) return new Map();
  const rows = await db.select({ postId: blogVisits.postId, views: count(), totalSeconds: sql<number>`coalesce(sum(${blogVisits.engagedSeconds}), 0)::double precision` })
    .from(blogVisits).where(inArray(blogVisits.postId, ids)).groupBy(blogVisits.postId);
  return new Map(rows.map((row) => [row.postId, { views: row.views, totalSeconds: row.totalSeconds, averageSeconds: row.views ? Math.round(row.totalSeconds / row.views) : 0 }]));
}
