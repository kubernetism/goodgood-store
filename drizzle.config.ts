import { defineConfig } from "drizzle-kit";

// Migrations are generated into ./drizzle (committed) and applied with
// `npm run db:migrate`, which uses the direct (unpooled) connection.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
});
