import "server-only";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { db } from "@/db/client";
import { adminSessions, adminUsers } from "@/db/schema";
import { serverEnv } from "@/server/env";
import { createSessionToken, isWellFormedToken, keyedHash } from "./tokens";

/*
 * Admin sessions: a random token in an httpOnly cookie, its keyed hash in
 * `admin_sessions`. Every admin page, Server Action and Route Handler calls
 * requireAdmin() on the server; that check is the only gate (there is no
 * proxy.ts, and a proxy redirect would never be a security boundary anyway).
 */

export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const isProduction = process.env.NODE_ENV === "production";
// __Host- pins the cookie to this exact host over HTTPS (no Domain, Path=/).
export const SESSION_COOKIE = isProduction ? "__Host-as_admin" : "as_admin";

export type AdminSession = { userId: string; email: string; sessionId: string };

function sessionIdFor(token: string): string {
  return keyedHash(token, serverEnv().AUTH_SECRET);
}

export async function createSession(userId: string): Promise<void> {
  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(adminSessions).values({ id: sessionIdFor(token), userId, expiresAt });

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** The signed-in admin for this request, or null. Deduplicated per request. */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  // Session expiry is request-time data, never part of a prerendered shell.
  await connection();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!isWellFormedToken(token)) return null;

  const sessionId = sessionIdFor(token);
  const [row] = await db
    .select({ userId: adminUsers.id, email: adminUsers.email })
    .from(adminSessions)
    .innerJoin(adminUsers, eq(adminUsers.id, adminSessions.userId))
    .where(and(eq(adminSessions.id, sessionId), gt(adminSessions.expiresAt, new Date())))
    .limit(1);

  return row ? { ...row, sessionId } : null;
});

/**
 * Gate for every admin entry point. Redirects to the login page when there is
 * no valid session; inside a Server Action the redirect aborts the action
 * before any work is done.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

/** Ends the current session (server row and cookie). */
export async function destroyCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (isWellFormedToken(token)) {
    await db.delete(adminSessions).where(eq(adminSessions.id, sessionIdFor(token)));
  }
  cookieStore.delete(SESSION_COOKIE);
}
