import { describe, expect, it } from "vitest";
import { defaultShopQuery, parseShopQuery as parseWithCategories, shopHref, shopParams } from "./shop-query";

const slugs = ["sidr", "acacia", "wildflower"];
const parseShopQuery = (raw: Parameters<typeof parseWithCategories>[0]) => parseWithCategories(raw, slugs);

describe("parseShopQuery", () => {
  it("returns defaults for empty params", () => {
    expect(parseShopQuery({})).toEqual(defaultShopQuery);
  });

  it("accepts known values", () => {
    expect(
      parseShopQuery({
        category: "sidr",
        tag: "Raw",
        q: "  comb ",
        min: "500",
        max: "4000",
        sort: "price-desc",
        view: "list",
        page: "2",
      }),
    ).toEqual({
      category: "sidr",
      tag: "Raw",
      q: "comb",
      minPrice: 500,
      maxPrice: 4000,
      sort: "price-desc",
      view: "list",
      page: 2,
    });
  });

  it("ignores unknown or malformed values instead of failing", () => {
    expect(
      parseShopQuery({ category: "vegetables", tag: "Juice", sort: "random", view: "table", page: "-3", min: "abc" }),
    ).toEqual(defaultShopQuery);
  });

  it("only accepts categories that exist right now", () => {
    expect(parseWithCategories({ category: "sidr" }, []).category).toBeNull();
    expect(parseWithCategories({ category: "new-harvest" }, ["new-harvest"]).category).toBe("new-harvest");
  });

  it("uses the first value when a param is repeated", () => {
    expect(parseShopQuery({ category: ["acacia", "sidr"] }).category).toBe("acacia");
  });

  it("swaps an inverted price range", () => {
    const query = parseShopQuery({ min: "5000", max: "1000" });
    expect([query.minPrice, query.maxPrice]).toEqual([1000, 5000]);
  });

  it("clamps page to at least 1 and caps search length", () => {
    expect(parseShopQuery({ page: "0" }).page).toBe(1);
    expect(parseShopQuery({ q: "x".repeat(200) }).q).toHaveLength(80);
  });
});

describe("shopHref", () => {
  it("omits defaults", () => {
    expect(shopHref(defaultShopQuery)).toBe("/shop");
  });

  it("resets to page 1 when a filter changes", () => {
    const onPageThree = { ...defaultShopQuery, page: 3 };
    expect(shopHref(onPageThree, { category: "gift-sets" })).toBe("/shop?category=gift-sets");
  });

  it("keeps an explicit page override", () => {
    expect(shopHref({ ...defaultShopQuery, sort: "rating" }, { page: 2 })).toBe("/shop?sort=rating&page=2");
  });

  it("encodes the search term", () => {
    expect(shopHref(defaultShopQuery, { q: "sidr & comb" })).toBe("/shop?q=sidr+%26+comb");
  });
});

describe("shopParams", () => {
  it("returns active params minus the omitted ones", () => {
    const query = { ...defaultShopQuery, category: "honeycomb" as const, sort: "rating" as const, page: 3 };
    expect(shopParams(query, ["sort"])).toEqual({ category: "honeycomb" });
  });
});
