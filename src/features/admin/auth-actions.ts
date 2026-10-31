"use server";

import { and, count, eq, gt, lt, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { db } from "@/db/client";
import { adminSessions, adminUsers, loginAttempts } from "@/db/schema";
import { isLockedOut, LOCKOUT_WINDOW_MS } from "@/server/auth/lockout";
import { getDummyHash, MAX_PASSWORD_LENGTH, verifyPassword } from "@/server/auth/password";
import { createSession, destroyCurrentSession } from "@/server/auth/session";
import { getClientIpHash } from "@/server/request";

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 254);
  const password = String(formData.get("password") ?? "").slice(0, MAX_PASSWORD_LENGTH + 1);
  const ipHash = await getClientIpHash();
  const since = new Date(Date.now() - LOCKOUT_WINDOW_MS);
  const [emailCounts, ipCount, users] = await Promise.all([
    // One scan of this email's recent failures gives both the global count and the count from this IP.
    db.select({ total: count(), fromIp: sql<number>`(count(*) filter (where ${loginAttempts.ipHash} = ${ipHash}))::integer` }).from(loginAttempts).where(and(eq(loginAttempts.email, email), eq(loginAttempts.succeeded, false), gt(loginAttempts.createdAt, since))),
    db.select({ value: count() }).from(loginAttempts).where(and(eq(loginAttempts.ipHash, ipHash), eq(loginAttempts.succeeded, false), gt(loginAttempts.createdAt, since))),
    db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1),
  ]);
  if (isLockedOut({ emailIpFailures: emailCounts[0]?.fromIp ?? 0, ipFailures: ipCount[0]?.value ?? 0, emailFailures: emailCounts[0]?.total ?? 0 })) redirect("/admin/login?error=locked");
  const user = users[0];
  const valid = await verifyPassword(password, user?.passwordHash ?? await getDummyHash());
  const success = Boolean(user && valid && password.length <= MAX_PASSWORD_LENGTH);
  await db.insert(loginAttempts).values({ email, ipHash, succeeded: success });
  if (!success || !user) redirect("/admin/login?error=invalid");
  await createSession(user.id);
  after(() => pruneAuthRecords(user.id));
  redirect("/admin");
}

/** Login attempts are only read inside the 15-minute lockout window; a day is ample for investigating abuse. */
const LOGIN_ATTEMPT_RETENTION_MS = 24 * 60 * 60 * 1000;

/**
 * Opportunistic cleanup after a successful sign-in (no cron needed): this
 * admin's expired sessions and everyone's stale login attempts. Runs after the
 * response, and a failure only leaves old rows behind.
 */
async function pruneAuthRecords(userId: string) {
  const now = Date.now();
  try {
    await db.batch([
      db.delete(adminSessions).where(and(eq(adminSessions.userId, userId), lt(adminSessions.expiresAt, new Date(now)))),
      db.delete(loginAttempts).where(lt(loginAttempts.createdAt, new Date(now - LOGIN_ATTEMPT_RETENTION_MS))),
    ]);
  } catch (cause) {
    console.error("Pruning expired sessions and old login attempts failed", cause);
  }
}

export async function logout() {
  await destroyCurrentSession();
  redirect("/admin/login");
}
