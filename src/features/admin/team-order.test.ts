import { describe, expect, it } from "vitest";
import { parseMoveDirection, planTeamMove } from "./team-order";

const rows = [
  { id: "a", sortOrder: 0 },
  { id: "b", sortOrder: 1 },
  { id: "c", sortOrder: 2 },
];

describe("planTeamMove", () => {
  it("swaps a member with its neighbour and updates only those two", () => {
    expect(planTeamMove(rows, "b", "up")).toEqual([{ id: "b", sortOrder: 0 }, { id: "a", sortOrder: 1 }]);
    expect(planTeamMove(rows, "b", "down")).toEqual([{ id: "c", sortOrder: 1 }, { id: "b", sortOrder: 2 }]);
  });

  it("does nothing at the edges or for an unknown member", () => {
    expect(planTeamMove(rows, "a", "up")).toEqual([]);
    expect(planTeamMove(rows, "c", "down")).toEqual([]);
    expect(planTeamMove(rows, "zzz", "up")).toEqual([]);
    expect(planTeamMove([], "a", "down")).toEqual([]);
  });

  it("renumbers ties and gaps so every move is visible", () => {
    const messy = [{ id: "a", sortOrder: 0 }, { id: "b", sortOrder: 0 }, { id: "c", sortOrder: 7 }];
    expect(planTeamMove(messy, "c", "up")).toEqual([{ id: "c", sortOrder: 1 }, { id: "b", sortOrder: 2 }]);
  });
});

describe("parseMoveDirection", () => {
  it("accepts only up and down", () => {
    expect(parseMoveDirection("up")).toBe("up");
    expect(parseMoveDirection("down")).toBe("down");
    expect(parseMoveDirection("sideways")).toBeNull();
    expect(parseMoveDirection("")).toBeNull();
  });
});
