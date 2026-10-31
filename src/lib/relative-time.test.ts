import { describe, expect, it } from "vitest";
import { formatRelativeAge } from "./relative-time";

const now = new Date("2026-10-31T12:00:00Z");
const ago = (ms: number) => new Date(now.getTime() - ms);
const MIN = 60_000, HOUR = 60 * MIN, DAY = 24 * HOUR;

describe("formatRelativeAge", () => {
  it("uses short units for recent times", () => {
    expect(formatRelativeAge(ago(10_000), now)).toBe("Just now");
    expect(formatRelativeAge(ago(5 * MIN), now)).toBe("5 min ago");
    expect(formatRelativeAge(ago(2 * HOUR), now)).toBe("2 h ago");
  });
  it("uses days, months and years for older times", () => {
    expect(formatRelativeAge(ago(DAY + HOUR), now)).toBe("Yesterday");
    expect(formatRelativeAge(ago(3 * DAY), now)).toBe("3 days ago");
    expect(formatRelativeAge(ago(65 * DAY), now)).toBe("2 months ago");
    expect(formatRelativeAge(ago(800 * DAY), now)).toBe("2 years ago");
  });
  it("treats future timestamps (clock skew) as just now", () => {
    expect(formatRelativeAge(new Date(now.getTime() + MIN), now)).toBe("Just now");
  });
});
