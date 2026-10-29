/*
 * Login throttling policy (pure, so it is unit tested). Counts are failed
 * attempts inside the window; a success does not erase earlier failures, so
 * an attacker can't reset the counter by also knowing one valid login.
 */

export const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;
/** Failures per email before that account is locked for the window. */
export const MAX_FAILURES_PER_EMAIL = 5;
/** Failures per client IP (any email) before that IP is blocked for the window. */
export const MAX_FAILURES_PER_IP = 20;

export type LockoutInput = { emailFailures: number; ipFailures: number };

export function isLockedOut({ emailFailures, ipFailures }: LockoutInput): boolean {
  return emailFailures >= MAX_FAILURES_PER_EMAIL || ipFailures >= MAX_FAILURES_PER_IP;
}

/** Remaining attempts for the email before lockout (for a gentle warning). */
export function attemptsLeft({ emailFailures }: Pick<LockoutInput, "emailFailures">): number {
  return Math.max(0, MAX_FAILURES_PER_EMAIL - emailFailures);
}
