import { describe, expect, it } from "vitest";
import { attemptsLeft, isLockedOut, MAX_FAILURES_PER_EMAIL, MAX_FAILURES_PER_EMAIL_IP, MAX_FAILURES_PER_IP } from "./lockout";
import { createSessionToken, isWellFormedToken } from "./tokens";

const none = { emailIpFailures: 0, ipFailures: 0, emailFailures: 0 };

describe("admin access helpers", () => {
  it("allows attempts below every threshold", () => {
    expect(isLockedOut({ emailIpFailures: MAX_FAILURES_PER_EMAIL_IP - 1, ipFailures: MAX_FAILURES_PER_IP - 1, emailFailures: MAX_FAILURES_PER_EMAIL - 1 })).toBe(false);
  });
  it("locks an email only for the IP that kept failing", () => {
    expect(isLockedOut({ ...none, emailIpFailures: MAX_FAILURES_PER_EMAIL_IP, ipFailures: MAX_FAILURES_PER_EMAIL_IP, emailFailures: MAX_FAILURES_PER_EMAIL_IP })).toBe(true);
    // The owner on another IP sees the same email failures but none from their own IP.
    expect(isLockedOut({ ...none, emailFailures: MAX_FAILURES_PER_EMAIL_IP * 4 })).toBe(false);
  });
  it("blocks an IP that fails across many emails", () => {
    expect(isLockedOut({ ...none, ipFailures: MAX_FAILURES_PER_IP })).toBe(true);
  });
  it("keeps a global per-email backstop for distributed guessing", () => {
    expect(MAX_FAILURES_PER_EMAIL).toBeGreaterThan(MAX_FAILURES_PER_IP);
    expect(isLockedOut({ ...none, emailFailures: MAX_FAILURES_PER_EMAIL })).toBe(true);
  });
  it("counts remaining attempts per email and IP", () => {
    expect(attemptsLeft({ emailIpFailures: 0 })).toBe(MAX_FAILURES_PER_EMAIL_IP);
    expect(attemptsLeft({ emailIpFailures: MAX_FAILURES_PER_EMAIL_IP + 3 })).toBe(0);
  });
  it("accepts only the expected random session token format", () => {
    expect(isWellFormedToken(createSessionToken())).toBe(true);
    expect(isWellFormedToken("invalid")).toBe(false);
  });
});
