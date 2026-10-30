/** One-time import of the original illustrative testimonials; existing rows are never overwritten. */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { testimonials } from "../src/db/schema";
import { testimonials as initialTestimonials } from "../src/content/company";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL must be set (see .env.example).");
const db = drizzle({ client: neon(url) });
const rows = await db.insert(testimonials).values(initialTestimonials.map((item, index) => ({
  id: `10000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
  ...item,
  sortOrder: index,
  isActive: true,
}))).onConflictDoNothing({ target: testimonials.id }).returning({ id: testimonials.id });
console.log(`Imported ${rows.length} of ${initialTestimonials.length} original testimonials; existing rows were left unchanged.`);
