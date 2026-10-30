import { afterEach, describe, expect, it, vi } from "vitest";
import { cartActions } from "./cart-store";

describe("removing unavailable cart items", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("removes only selected items from the latest saved cart", () => {
    let saved = JSON.stringify([
      { slug: "unavailable-honey", quantity: 5 },
      { slug: "available-honey", quantity: 2 },
      { slug: "added-later", quantity: 1 },
    ]);
    vi.stubGlobal("window", {
      localStorage: {
        getItem: () => saved,
        setItem: (_key: string, value: string) => { saved = value; },
      },
    });

    cartActions.removeMany(["unavailable-honey"]);

    expect(JSON.parse(saved)).toEqual([
      { slug: "available-honey", quantity: 2 },
      { slug: "added-later", quantity: 1 },
    ]);
  });
});
