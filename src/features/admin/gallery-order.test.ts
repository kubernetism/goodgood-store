import { describe, expect, it } from "vitest";
import { mergeSelection, moveItem } from "./gallery-order";

describe("moveItem", () => {
  it("moves an item up or down by one place", () => {
    expect(moveItem(["a", "b", "c"], 1, -1)).toEqual(["b", "a", "c"]);
    expect(moveItem(["a", "b", "c"], 1, 1)).toEqual(["a", "c", "b"]);
  });
  it("ignores moves past either end", () => {
    expect(moveItem(["a", "b"], 0, -1)).toEqual(["a", "b"]);
    expect(moveItem(["a", "b"], 1, 1)).toEqual(["a", "b"]);
  });
});

describe("mergeSelection", () => {
  it("keeps the current order, drops deselected images and appends new ones", () => {
    expect(mergeSelection(["a", "b", "c"], ["c", "d", "a"])).toEqual(["a", "c", "d"]);
  });
  it("never produces duplicates", () => {
    expect(mergeSelection(["a"], ["a", "b", "b"])).toEqual(["a", "b"]);
  });
});
