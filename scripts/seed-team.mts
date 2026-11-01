/**
 * One-time import of the business contacts listed in src/lib/site.ts as team
 * members (name and a neutral role only; no invented bios). They are created
 * hidden: set each role, photo, bio and contact details in Admin > Team, then
 * publish. Existing rows are never overwritten.
 * Usage: npm run db:seed-team (after npm run db:migrate).
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { teamMembers } from "../src/db/schema";
import { siteConfig } from "../src/lib/site";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL must be set (see .env.example).");
const db = drizzle({ client: neon(url) });
const people = siteConfig.contact.people;
const rows = await db.insert(teamMembers).values(people.map((person, index) => ({
  id: `20000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
  name: person.name,
  // A neutral, factual label (they are the business's phone contacts); edit it in the admin.
  role: "Customer contact",
  sortOrder: index,
  isPublished: false,
}))).onConflictDoNothing({ target: teamMembers.id }).returning({ id: teamMembers.id });
console.log(`Imported ${rows.length} of ${people.length} contacts as hidden team members; existing rows were left unchanged.`);
