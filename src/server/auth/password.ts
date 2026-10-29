import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

/*
 * Password hashing with Node's built-in scrypt (no native dependency).
 * Parameters follow the OWASP Password Storage Cheat Sheet minimum for
 * scrypt (N=2^17, r=8, p=1). Stored format:
 *   scrypt$<N>$<r>$<p>$<salt base64url>$<hash base64url>
 * Parameters live in the hash, so they can be raised later without
 * invalidating existing passwords.
 */

const N = 2 ** 17;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;
const SALT_BYTES = 16;

export const MIN_PASSWORD_LENGTH = 12;
export const MAX_PASSWORD_LENGTH = 200;

function derive(password: string, salt: Buffer, options: ScryptOptions, keyLength: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // maxmem must exceed 128 * N * r bytes (128 MiB at these settings).
    scrypt(password.normalize("NFKC"), salt, keyLength, { ...options, maxmem: 256 * 1024 * 1024 }, (error, key) =>
      error ? reject(error) : resolve(key),
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const key = await derive(password, salt, { N, r: R, p: P }, KEY_LENGTH);
  return ["scrypt", N, R, P, salt.toString("base64url"), key.toString("base64url")].join("$");
}

/** Constant-time check. Malformed hashes simply fail. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, n, r, p, saltText, hashText] = parts;
  const params = { N: Number(n), r: Number(r), p: Number(p) };
  if (![params.N, params.r, params.p].every((value) => Number.isInteger(value) && value > 0)) return false;

  const expected = Buffer.from(hashText ?? "", "base64url");
  if (expected.length === 0) return false;
  const actual = await derive(password, Buffer.from(saltText ?? "", "base64url"), params, expected.length);
  return timingSafeEqual(actual, expected);
}

/**
 * A real hash of a random password, verified against when the email is
 * unknown so a login attempt takes the same time whether or not the account
 * exists (no user enumeration by timing).
 */
let dummyHash: Promise<string> | undefined;
export function getDummyHash(): Promise<string> {
  dummyHash ??= hashPassword(randomBytes(24).toString("base64url"));
  return dummyHash;
}

export function validateNewPassword(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  if (password.length > MAX_PASSWORD_LENGTH) return `Use at most ${MAX_PASSWORD_LENGTH} characters.`;
  return null;
}
