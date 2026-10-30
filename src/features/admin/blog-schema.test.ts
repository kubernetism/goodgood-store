import { describe, expect, it } from "vitest";
import { blogFormSchema } from "./blog-schema";

const post = { title: "From the hive", slug: "from-the-hive", excerpt: "A honey story", category: "beekeeping", author: "Abdul Sami Honey", publishedOn: "2026-10-29", tags: "Honey, Bees, Honey", body: "Hello bees.", coverId: "", isPublished: false };
describe("blog form", () => {
  it("parses safe article text, tags, cover and draft status", () => {
    expect(blogFormSchema.parse(post)).toMatchObject({ body: [{ type: "paragraph", text: "Hello bees." }], tags: ["Honey", "Bees"], coverId: null, isPublished: false });
  });
  it("rejects invalid inputs", () => {
    for (const change of [{ title: " " }, { slug: "Bad Slug" }, { category: "invalid" }, { publishedOn: "2026-99-99" }, { body: "  " }, { coverId: "invalid" }]) expect(blogFormSchema.safeParse({ ...post, ...change }).success).toBe(false);
  });
});
