/** Import the original blog posts without overwriting any edited records. */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { inArray } from "drizzle-orm";
import { blogPosts, contentSlots } from "../src/db/schema";
import { blogPosts as initialPosts } from "../src/features/blog/data";
import { blogCoverSlotKey } from "../src/features/content/slots";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL must be set (see .env.example).");
const db = drizzle({ client: neon(url) });
const covers = await db.select({ key: contentSlots.key, mediaId: contentSlots.mediaId }).from(contentSlots)
  .where(inArray(contentSlots.key, initialPosts.map((post) => blogCoverSlotKey(post.slug))));
const coverByKey = new Map(covers.map((cover) => [cover.key, cover.mediaId]));
const inserted = await db.insert(blogPosts).values(initialPosts.map((post) => ({
  ...post,
  tags: [...post.tags],
  coverId: coverByKey.get(blogCoverSlotKey(post.slug)) ?? null,
  isPublished: true,
}))).onConflictDoNothing({ target: blogPosts.slug }).returning({ slug: blogPosts.slug });
console.log(`Imported ${inserted.length} of ${initialPosts.length} original blog posts; existing posts were left unchanged.`);
