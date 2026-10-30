import { describe, expect, it } from "vitest";
import { activeElapsedMs } from "./tracking-math";
import { formatReadingTime } from "./metrics";

describe("active blog reading time", () => {
  it("counts only time when the article and tab are visible", () => {
    expect(activeElapsedMs(1000, 2000, 1000, true, true, 60000)).toBe(1000);
    expect(activeElapsedMs(1000, 2000, 1000, false, true, 60000)).toBe(0);
    expect(activeElapsedMs(1000, 2000, 1000, true, false, 60000)).toBe(0);
  });
  it("stops at the idle limit and resumes on interaction", () => {
    expect(activeElapsedMs(59000, 63000, 0, true, true, 60000)).toBe(1000);
    expect(activeElapsedMs(61000, 63000, 0, true, true, 60000)).toBe(0);
    expect(activeElapsedMs(63000, 64000, 63000, true, true, 60000)).toBe(1000);
  });
  it("formats measured time clearly", () => {
    expect(formatReadingTime(75)).toBe("1m 15s");
    expect(formatReadingTime(0)).toBe("0s");
  });
});
