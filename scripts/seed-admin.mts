/**
 * Creates the admin account, or resets its password, from ADMIN_EMAIL and
 * ADMIN_PASSWORD. Only a scrypt hash is stored; existing sessions for the
 * account are signed out. ADMIN_PASSWORD can be removed from the environment
 * afterwards: login checks the stored hash.
 *
 * Usage: npm run db:seed-admin
 */
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { adminSessions, adminUsers } from "../src/db/schema";
import { hashPassword, validateNewPassword } from "../src/server/auth/password";

function fail(message: string): never {
  console.error(`seed-admin: ${message}`);
  process.exit(1);
}

const url = process.env.DATABASE_URL ?? fail("DATABASE_URL is not set (see .env.example).");
const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? "";

if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) fail("ADMIN_EMAIL is missing or not an email address.");
if (!password) fail("ADMIN_PASSWORD is empty. Put the admin password in .env.local and run this again.");
const problem = validateNewPassword(password);
if (problem) fail(`ADMIN_PASSWORD is too weak: ${problem}`);

const db = drizzle({ client: neon(url) });
const passwordHash = await hashPassword(password);

const [user] = await db
  .insert(adminUsers)
  .values({ email, passwordHash })
  .onConflictDoUpdate({ target: adminUsers.email, set: { passwordHash, updatedAt: new Date() } })
  .returning({ id: adminUsers.id });

if (!user) fail("Could not create the admin user.");
await db.delete(adminSessions).where(eq(adminSessions.userId, user.id));

console.log(`Admin ready: ${email}. Password hash stored; any previous sessions were signed out.`);
