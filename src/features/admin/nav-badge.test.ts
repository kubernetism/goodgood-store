import { describe, expect, it } from "vitest";
import { navBadge } from "./nav-badge";

describe("navBadge", () => {
  it("hides the badge when nothing is waiting", () => {
    expect(navBadge("Messages", 0)).toBeNull();
    expect(navBadge("Orders", 0, "pending")).toBeNull();
  });
  it("gives an accessible name with the exact count and caps the visible text", () => {
    expect(navBadge("Messages", 3)).toEqual({ text: "3", ariaLabel: "Messages, 3 unread" });
    expect(navBadge("Messages", 120)).toEqual({ text: "99+", ariaLabel: "Messages, 120 unread" });
  });
  it("names pending orders", () => {
    expect(navBadge("Orders", 4, "pending")).toEqual({ text: "4", ariaLabel: "Orders, 4 pending" });
  });
});
