import { describe, expect, it } from "vitest";
import { blogPosts } from "./data";
import { formatBlogBody, parseBlogBody } from "./editor-body";

describe("blog editor content", () => {
  it("round-trips all existing article blocks without losing text", () => {
    for (const post of blogPosts) expect(parseBlogBody(formatBlogBody(post.body))).toEqual(post.body);
  });
  it("reads paragraphs, headings, lists and quotes", () => {
    expect(parseBlogBody("Intro\n\n## Heading\n\n- One\n- Two\n\n> A quote\n> — A beekeeper")).toEqual([
      { type: "paragraph", text: "Intro" }, { type: "heading", text: "Heading" },
      { type: "list", items: ["One", "Two"] }, { type: "quote", text: "A quote", cite: "A beekeeper" },
    ]);
  });
});
