import "server-only";
import { desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db/client";
import { blogPosts, media } from "@/db/schema";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { blogCategories, type BlogCategorySlug, type BlogPost } from "./data";

/** Only published posts reach the storefront. */
export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.blog);
  const rows = await db.select({ post: blogPosts, url: media.url, alt: media.alt, width: media.width, height: media.height })
    .from(blogPosts).leftJoin(media, eq(blogPosts.coverId, media.id))
    .where(eq(blogPosts.isPublished, true)).orderBy(desc(blogPosts.publishedOn));
  return rows.map(({ post, url, alt, width, height }) => ({
    ...post,
    category: (blogCategories.find((item) => item.slug === post.category)?.slug ?? "beekeeping") as BlogCategorySlug,
    cover: url && alt ? { url, alt, width, height } : null,
  }));
}
