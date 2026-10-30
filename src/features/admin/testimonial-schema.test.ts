import { describe, expect, it } from "vitest";
import { testimonialFormSchema } from "./testimonial-schema";

const input = { name: "A customer", role: "Lahore", quote: "Lovely honey", rating: "4.5", sortOrder: "2", isActive: true };
describe("testimonial form", () => {
  it("normalizes rating and display order", () => expect(testimonialFormSchema.parse(input)).toMatchObject({ rating: 4.5, sortOrder: 2, isActive: true }));
  it("rejects invalid names, ratings, and empty testimonials", () => {
    for (const change of [{ name: " " }, { quote: " " }, { rating: "0" }, { rating: "5.5" }, { rating: "4.2" }, { sortOrder: "-1" }]) expect(testimonialFormSchema.safeParse({ ...input, ...change }).success).toBe(false);
  });
});
