import { createHmac, randomBytes } from "node:crypto";

/** 256-bit random session token for the cookie. */
export function createSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * Keyed hash of a secret value (session token, client IP). Only the hash is
 * stored, so a database leak can't be turned back into working cookies.
 */
export function keyedHash(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

/** Cookie tokens are 43 base64url chars; reject anything else before hashing. */
export function isWellFormedToken(value: string | undefined): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{43}$/.test(value);
}
