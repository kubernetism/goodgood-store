import { describe, expect, it } from "vitest";
import { slidingItemTranslation, wrapRowOffset } from "./sliding-row-math";

describe("sliding rows", () => {
  it("moves cards right to left at a constant offset", () => {
    expect(slidingItemTranslation(0, 18, 400, 4)).toBe(-18);
    expect(slidingItemTranslation(2, 18, 400, 4)).toBe(-18);
  });
  it("wraps a fully departed card to the right without duplicating it", () => {
    expect(slidingItemTranslation(0, 399, 400, 4)).toBe(-399);
    expect(slidingItemTranslation(0, 401, 400, 4)).toBe(1199);
  });
  it("returns exactly to the initial arrangement after a cycle", () => {
    for (let index = 0; index < 4; index++) {
      expect(slidingItemTranslation(index, 1600, 400, 4)).toBe(slidingItemTranslation(index, 0, 400, 4));
    }
  });
  it("supports dragging in either direction", () => {
    expect(wrapRowOffset(-20, 1600)).toBe(1580);
    expect(wrapRowOffset(1620, 1600)).toBe(20);
  });
  it("leaves single cards and unmeasured rows stationary", () => {
    expect(slidingItemTranslation(0, 20, 400, 1)).toBe(0);
    expect(slidingItemTranslation(0, 20, 0, 4)).toBe(0);
    expect(wrapRowOffset(20, 0)).toBe(0);
  });
});
