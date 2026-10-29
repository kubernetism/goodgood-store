/**
 * Applies the SQL migrations in ./drizzle to DATABASE_URL_UNPOOLED (or
 * DATABASE_URL). Usage: npm run db:migrate
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL_UNPOOLED or DATABASE_URL must be set (see .env.example).");
  process.exit(1);
}

await migrate(drizzle({ client: neon(url) }), { migrationsFolder: "./drizzle" });
console.log("Migrations applied.");
