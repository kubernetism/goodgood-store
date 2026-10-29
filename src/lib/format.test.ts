import { describe, expect, it } from "vitest";
import { formatDate, formatPrice, formatRupees } from "./format";

describe("formatPrice", () => {
  it("formats integer paisa as whole rupees with a non-breaking space", () => {
    expect(formatPrice(245_000)).toBe("Rs 2,450");
    expect(formatPrice(25_000)).toBe("Rs 250");
  });

  it("groups thousands in threes", () => {
    expect(formatPrice(125_000_000)).toBe("Rs 1,250,000");
  });

  it("shows paisa when a price is not a whole rupee", () => {
    expect(formatPrice(99_950)).toBe("Rs 999.5");
    expect(formatPrice(0)).toBe("Rs 0");
  });
});

describe("formatRupees", () => {
  it("formats whole rupees", () => {
    expect(formatRupees(5000)).toBe("Rs 5,000");
  });
});

describe("formatDate", () => {
  it("renders ISO dates day-month-year in UTC", () => {
    expect(formatDate("2026-10-14")).toBe("14 October 2026");
  });
});
