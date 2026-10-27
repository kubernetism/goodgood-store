import { describe, expect, it } from "vitest";
import { blogHref, getAdjacentPosts, getLatestPosts, parseBlogQuery, queryPosts } from "./queries";

describe("blog queries", () => {
  it("parses known filters and ignores unknown ones", () => {
    expect(parseBlogQuery({ category: "recipes", tag: "Recipe", q: " salad ", page: "2" })).toEqual({
      category: "recipes",
      tag: "Recipe",
      q: "salad",
      page: 2,
    });
    expect(parseBlogQuery({ category: "cars", tag: "Oil", page: "x" })).toEqual({
      category: null,
      tag: null,
      q: "",
      page: 1,
    });
  });

  it("lists newest first and paginates", () => {
    const latest = getLatestPosts();
    expect(latest[0].publishedOn >= latest[1].publishedOn).toBe(true);
    const page = queryPosts({ category: null, tag: null, q: "", page: 1 }, 4);
    expect(page.items).toHaveLength(4);
    expect(page.pageCount).toBe(Math.ceil(latest.length / 4));
  });

  it("finds adjacent posts by date", () => {
    const [newest, second] = getLatestPosts();
    expect(getAdjacentPosts(newest.slug)).toEqual({ previous: second, next: undefined });
  });

  it("builds compact URLs", () => {
    expect(blogHref({ category: null, tag: null, q: "", page: 3 }, { category: "recipes" })).toBe("/blog?category=recipes");
  });
});
