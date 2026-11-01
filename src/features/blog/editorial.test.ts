import { describe, expect, it } from "vitest";
import { blogPosts, type BlogPost } from "./data";
import { estimateReadingMinutes, formatReadingMinutes, getHeadingAnchors, getRelatedPosts } from "./editorial";

const words = (count: number) => Array.from({ length: count }, () => "honey").join(" ");

describe("estimateReadingMinutes", () => {
  it("never reports less than one minute", () => {
    expect(estimateReadingMinutes({ excerpt: "", body: [] })).toBe(1);
  });

  it("counts excerpt and every block type at 200 words a minute", () => {
    const minutes = estimateReadingMinutes({
      excerpt: words(50),
      body: [
        { type: "paragraph", text: words(150) },
        { type: "heading", text: words(50) },
        { type: "list", items: [words(100), words(50)] },
        { type: "quote", text: words(49), cite: "Sami" },
      ],
    });
    // 50 + 150 + 50 + 150 + 50 = 450 words -> 2.25 -> 3 minutes
    expect(minutes).toBe(3);
    expect(formatReadingMinutes(minutes)).toBe("3 min read");
  });
});

describe("getRelatedPosts", () => {
  it("prefers the same category, excludes the current post and respects the limit", () => {
    const current = blogPosts.find((post) => post.slug === "a-sidr-harvest-in-karak")!;
    const related = getRelatedPosts(blogPosts, current, 3);
    expect(related).toHaveLength(3);
    expect(related.map((post) => post.slug)).not.toContain(current.slug);
    expect(related[0]?.category).toBe(current.category);
    // The remainder are the newest posts from other categories.
    expect(related[1]!.publishedOn >= related[2]!.publishedOn).toBe(true);
  });

  it("returns fewer when there are not enough posts", () => {
    const only = blogPosts[0] as BlogPost;
    expect(getRelatedPosts([only], only)).toEqual([]);
  });
});

describe("getHeadingAnchors", () => {
  it("creates unique, url-safe ids keyed by block index", () => {
    const anchors = getHeadingAnchors([
      { type: "paragraph", text: "Intro" },
      { type: "heading", text: "From drum to jar!" },
      { type: "heading", text: "From drum to jar" },
      { type: "heading", text: "Méthode & tips" },
    ]);
    expect([...anchors.keys()]).toEqual([1, 2, 3]);
    expect(anchors.get(1)?.id).toBe("section-from-drum-to-jar");
    expect(anchors.get(2)?.id).toBe("section-from-drum-to-jar-2");
    expect(anchors.get(3)?.id).toBe("section-methode-tips");
  });
});
