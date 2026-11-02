import { describe, expect, it } from "vitest";
import { blogCoverCardImage, brandCardImage, clampText, productCardImage, productCardModel, productCardPath } from "./card-model";

const product = { slug: "sidr-honey", name: "Sidr Honey", summary: "Raw and pure.", price: 250_000, stock: 5 };

describe("productCardModel", () => {
  it("shows the product page's price, with no sale row when not discounted", () => {
    expect(productCardModel(product)).toMatchObject({
      name: "Sidr Honey",
      line: "Raw and pure.",
      price: "Rs\u00a02,500",
      oldPrice: null,
      percentOff: null,
      soldOut: false,
    });
  });

  it("adds the struck-through price and percent off when on sale", () => {
    expect(productCardModel({ ...product, compareAtPrice: 312_500 })).toMatchObject({
      price: "Rs\u00a02,500",
      oldPrice: "Rs\u00a03,125",
      percentOff: 20,
    });
  });

  it("ignores a compare-at price that is not higher than the price", () => {
    expect(productCardModel({ ...product, compareAtPrice: 250_000 })).toMatchObject({ oldPrice: null, percentOff: null });
  });

  it("flags sold-out products", () => {
    expect(productCardModel({ ...product, stock: 0 }).soldOut).toBe(true);
  });

  it("shrinks and clamps very long names", () => {
    const short = productCardModel(product);
    const long = productCardModel({ ...product, name: "Premium Wild Mountain Forest Sidr Honey From The Karak Hills Harvested By Hand In Spring Season" });
    expect(long.nameSize).toBeLessThan(short.nameSize);
    expect(long.name.length).toBeLessThanOrEqual(72);
    expect(long.name.endsWith("…")).toBe(true);
  });

  it("shrinks very long prices rather than letting them overflow", () => {
    const model = productCardModel({ ...product, price: 123_456_789_012 });
    expect(model.priceSize).toBeLessThan(productCardModel(product).priceSize);
  });

  it("gives the short line less room when a long name and a sale row need it", () => {
    const summary = "A long and very descriptive line about where this honey comes from and how it tastes.";
    const longName = "Wild Mountain Forest Sidr Honey From Karak";
    expect(productCardModel({ ...product, summary }).line?.length).toBeLessThanOrEqual(72);
    expect(productCardModel({ ...product, summary, compareAtPrice: 300_000 }).line?.length).toBeLessThanOrEqual(72);
    expect(productCardModel({ ...product, name: longName, summary, compareAtPrice: 300_000 }).line?.length).toBeLessThanOrEqual(36);
  });

  it("keeps only text the font can draw, with the brand name if nothing is left", () => {
    expect(productCardModel({ ...product, name: "خالص شہد Sidr", summary: "اصلی 🍯 شہد" })).toMatchObject({ name: "Sidr", line: null });
    expect(productCardModel({ ...product, name: "خالص شہد" }).name).toBe("Abdul Sami Honey");
  });

  it("drops an empty short line", () => {
    expect(productCardModel({ ...product, summary: "   " }).line).toBeNull();
  });
});

describe("clampText", () => {
  it("cuts at a word boundary and removes trailing punctuation", () => {
    expect(clampText("Raw, pure, golden honey from Karak", 12)).toBe("Raw, pure…");
  });

  it("cuts a single very long word", () => {
    expect(clampText("a".repeat(40), 10)).toBe(`${"a".repeat(9)}…`);
  });

  it("collapses whitespace", () => {
    expect(clampText("  Raw \n  honey ", 40)).toBe("Raw honey");
  });
});

describe("card image metadata", () => {
  it("describes the product card with an alt naming the product and price", () => {
    expect(productCardImage(product)).toEqual({
      url: "/shop/sidr-honey/card.jpg",
      width: 1200,
      height: 630,
      type: "image/jpeg",
      alt: "Sidr Honey, Rs\u00a02,500. Honey by Abdul Sami Enterprises.",
    });
  });

  it("says sold out instead of a price in the alt of a sold-out product", () => {
    expect(productCardImage({ ...product, stock: 0 }).alt).toContain("sold out");
  });

  it("encodes the slug in the card URL", () => {
    expect(productCardPath("a b")).toBe("/shop/a%20b/card.jpg");
  });

  it("describes a blog cover at card size with the cover's alt", () => {
    expect(blogCoverCardImage("a-post", "A jar")).toEqual({ url: "/blog/a-post/cover.jpg", width: 1200, height: 630, type: "image/jpeg", alt: "A jar" });
  });

  it("describes the shared brand card", () => {
    expect(brandCardImage).toMatchObject({ url: "/brand-card.jpg", width: 1200, height: 630, type: "image/jpeg" });
  });
});
