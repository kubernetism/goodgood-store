import "server-only";
import { asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db/client";
import { testimonials } from "@/db/schema";
import { CACHE_TAGS } from "@/lib/cache-tags";

export async function getVisibleTestimonials() {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.testimonials);
  return db.select({ id: testimonials.id, name: testimonials.name, role: testimonials.role, quote: testimonials.quote, rating: testimonials.rating })
    .from(testimonials)
    .where(eq(testimonials.isActive, true))
    .orderBy(asc(testimonials.sortOrder), asc(testimonials.createdAt), asc(testimonials.id))
    .limit(10);
}
