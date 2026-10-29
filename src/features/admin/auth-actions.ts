"use server";

import { and, count, eq, gt } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { adminUsers, loginAttempts } from "@/db/schema";
import { isLockedOut, LOCKOUT_WINDOW_MS } from "@/server/auth/lockout";
import { getDummyHash, MAX_PASSWORD_LENGTH, verifyPassword } from "@/server/auth/password";
import { createSession, destroyCurrentSession } from "@/server/auth/session";
import { getClientIpHash } from "@/server/request";

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 254);
  const password = String(formData.get("password") ?? "").slice(0, MAX_PASSWORD_LENGTH + 1);
  const ipHash = await getClientIpHash();
  const since = new Date(Date.now() - LOCKOUT_WINDOW_MS);
  const [emailCount, ipCount, users] = await Promise.all([
    db.select({ value: count() }).from(loginAttempts).where(and(eq(loginAttempts.email, email), eq(loginAttempts.succeeded, false), gt(loginAttempts.createdAt, since))),
    db.select({ value: count() }).from(loginAttempts).where(and(eq(loginAttempts.ipHash, ipHash), eq(loginAttempts.succeeded, false), gt(loginAttempts.createdAt, since))),
    db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1),
  ]);
  if (isLockedOut({ emailFailures: emailCount[0]?.value ?? 0, ipFailures: ipCount[0]?.value ?? 0 })) redirect("/admin/login?error=locked");
  const user = users[0];
  const valid = await verifyPassword(password, user?.passwordHash ?? await getDummyHash());
  const success = Boolean(user && valid && password.length <= MAX_PASSWORD_LENGTH);
  await db.insert(loginAttempts).values({ email, ipHash, succeeded: success });
  if (!success || !user) redirect("/admin/login?error=invalid");
  await createSession(user.id);
  redirect("/admin");
}

export async function logout() {
  await destroyCurrentSession();
  redirect("/admin/login");
}
