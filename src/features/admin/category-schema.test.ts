import { describe, expect, it } from "vitest";
import { categoryFormSchema } from "./category-schema";

const category = { name: "Sidr honey", slug: "sidr-honey", blurb: "Honey", sortOrder: "2", imageId: "", isActive: true };

describe("category validation", () => {
  it("accepts a new category and normalizes optional image and order", () => {
    expect(categoryFormSchema.parse(category)).toMatchObject({ imageId: null, sortOrder: 2, isActive: true });
  });
  it("rejects invalid names, slugs, images and display orders", () => {
    for (const change of [{ name: "  " }, { slug: "Sidr Honey" }, { imageId: "not-a-uuid" }, { sortOrder: "-1" }]) {
      expect(categoryFormSchema.safeParse({ ...category, ...change }).success).toBe(false);
    }
  });
});
