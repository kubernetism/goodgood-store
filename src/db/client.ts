import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { serverEnv } from "@/server/env";
import * as schema from "./schema";

/*
 * Neon's HTTP driver: one round trip per query, no connection pool to exhaust
 * on serverless. Multi-statement writes use `db.batch([...])`, which runs as a
 * single transaction (all or nothing).
 */
export const db = drizzle({ client: neon(serverEnv().DATABASE_URL), schema });

export type Db = typeof db;
