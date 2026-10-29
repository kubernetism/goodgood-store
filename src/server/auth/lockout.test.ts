import { describe, expect, it } from "vitest";
import { isLockedOut, MAX_FAILURES_PER_EMAIL, MAX_FAILURES_PER_IP } from "./lockout";
import { createSessionToken, isWellFormedToken } from "./tokens";

describe("admin access helpers", () => {
  it("locks out at either threshold", () => {
    expect(isLockedOut({ emailFailures: MAX_FAILURES_PER_EMAIL - 1, ipFailures: MAX_FAILURES_PER_IP - 1 })).toBe(false);
    expect(isLockedOut({ emailFailures: MAX_FAILURES_PER_EMAIL, ipFailures: 0 })).toBe(true);
    expect(isLockedOut({ emailFailures: 0, ipFailures: MAX_FAILURES_PER_IP })).toBe(true);
  });
  it("accepts only the expected random session token format", () => {
    expect(isWellFormedToken(createSessionToken())).toBe(true);
    expect(isWellFormedToken("invalid")).toBe(false);
  });
});
