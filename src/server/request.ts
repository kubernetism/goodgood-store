import "server-only";
import { headers } from "next/headers";
import { keyedHash } from "@/server/auth/tokens";
import { serverEnv } from "@/server/env";

/**
 * Best-effort client IP. On Vercel `x-forwarded-for` is set by the platform;
 * behind other proxies it can be spoofed, so it is only used for throttling,
 * never for authorization.
 */
export async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headerList.get("x-real-ip")?.trim() || "unknown";
}

/** Keyed hash of the client IP (raw IPs are personal data; we don't store them). */
export async function getClientIpHash(): Promise<string> {
  return keyedHash(await getClientIp(), serverEnv().AUTH_SECRET);
}
