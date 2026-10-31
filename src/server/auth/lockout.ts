/*
 * Login throttling policy (pure, so it is unit tested). Counts are failed
 * attempts inside the window; a success does not erase earlier failures, so
 * an attacker can't reset the counter by also knowing one valid login.
 *
 * The tight per-account limit is scoped to email + client IP, so a stranger
 * guessing the owner's password locks out only their own IP, not the owner.
 * A much higher per-email cap (any IP) remains as a backstop against a
 * distributed guessing attack.
 */

export const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;
/** Failures for one email from one client IP before that pair is locked for the window. */
export const MAX_FAILURES_PER_EMAIL_IP = 5;
/** Failures per client IP (any email) before that IP is blocked for the window. */
export const MAX_FAILURES_PER_IP = 20;
/** Failures per email from any IP before the account is locked for the window (distributed-attack backstop). */
export const MAX_FAILURES_PER_EMAIL = 50;

export type LockoutInput = { emailIpFailures: number; ipFailures: number; emailFailures: number };

export function isLockedOut({ emailIpFailures, ipFailures, emailFailures }: LockoutInput): boolean {
  return emailIpFailures >= MAX_FAILURES_PER_EMAIL_IP || ipFailures >= MAX_FAILURES_PER_IP || emailFailures >= MAX_FAILURES_PER_EMAIL;
}

/** Remaining attempts for this email from this IP before lockout (for a gentle warning). */
export function attemptsLeft({ emailIpFailures }: Pick<LockoutInput, "emailIpFailures">): number {
  return Math.max(0, MAX_FAILURES_PER_EMAIL_IP - emailIpFailures);
}
