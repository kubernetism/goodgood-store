import { describe, expect, it } from "vitest";
import { emptyMediaUsage, isMediaUnused, mediaDeleteWarning, mediaUsageGroups, summariseNames } from "./media-usage";

describe("media usage", () => {
  it("says an unused image only leaves the library", () => {
    const usage = emptyMediaUsage();
    expect(isMediaUnused(usage)).toBe(true);
    expect(mediaUsageGroups(usage)).toEqual([]);
    expect(mediaDeleteWarning(usage)).toContain("isn't used anywhere");
  });
  it("lists every place the image is used with singular and plural labels", () => {
    const usage = { ...emptyMediaUsage(), products: ["Acacia Honey", "Sidr Honey"], blogPosts: ["Why raw honey crystallises"] };
    expect(mediaUsageGroups(usage)).toEqual([
      { label: "Product galleries", names: ["Acacia Honey", "Sidr Honey"] },
      { label: "Blog cover", names: ["Why raw honey crystallises"] },
    ]);
  });
  it("explains what loses the image when it is deleted", () => {
    const warning = mediaDeleteWarning({ products: ["Sidr Honey"], categories: ["Raw", "Wild"], banners: ["Eid deal"], blogPosts: [], contentSlots: ["Home page: Hero photo"] });
    expect(warning).toBe("Deleting this image is permanent. It will be removed from the photo gallery of 1 product. 2 categories, 1 banner, 1 content slot will lose it and show a placeholder instead.");
  });
  it("shortens long name lists", () => {
    expect(summariseNames(["A", "B"])).toBe("A, B");
    expect(summariseNames(["A", "B", "C", "D", "E"])).toBe("A, B, C and 2 more");
  });
});
