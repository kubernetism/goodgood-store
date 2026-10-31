import { describe, expect, it } from "vitest";
import { adjustmentLine, checkoutFieldDisplayOrder, errorSummaryTitle, itemCountLabel, orderedFieldErrors } from "./messages";
import { checkoutFields } from "./validation";

describe("checkoutFieldDisplayOrder", () => {
  it("covers every submitted field exactly once", () => {
    expect([...checkoutFieldDisplayOrder].sort()).toEqual([...checkoutFields].sort());
  });
});

describe("orderedFieldErrors", () => {
  it("lists errors in page order, not server order, and skips the cart error", () => {
    // Server order puts province before street; the page shows the address first.
    const result = orderedFieldErrors({ province: "Choose a province.", street: "Enter a street.", firstName: "Enter a name.", cart: "Empty." });
    expect(result.map((entry) => entry.field)).toEqual(["firstName", "street", "province"]);
    expect(result[1]).toEqual({ field: "street", message: "Enter a street." });
  });
  it("returns nothing when there are no field errors", () => {
    expect(orderedFieldErrors({})).toEqual([]);
  });
});

describe("copy helpers", () => {
  it("pluralises the error summary and item counts", () => {
    expect(errorSummaryTitle(1)).toBe("Please check 1 field");
    expect(errorSummaryTitle(4)).toBe("Please check 4 fields");
    expect(itemCountLabel(1)).toBe("1 item");
    expect(itemCountLabel(0)).toBe("0 items");
  });
  it("describes reduced and sold-out lines", () => {
    expect(adjustmentLine({ name: "Sidr Honey", available: 2 })).toBe("Sidr Honey: only 2 left, quantity updated.");
    expect(adjustmentLine({ name: "Beri Honey", available: 0 })).toBe("Beri Honey: sold out, removed from your order.");
  });
});
