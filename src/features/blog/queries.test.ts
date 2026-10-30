import { describe, expect, it } from "vitest";
import { blogHref, getAdjacentPosts, getLatestPosts, parseBlogQuery, queryPosts } from "./queries";
import { blogPosts } from "./data";

describe("blog queries", () => {
  it("parses known filters and ignores unknown ones", () => {
    expect(parseBlogQuery({ category: "recipes", tag: "Recipe", q: " salad ", page: "2" }, blogPosts)).toEqual({
      category: "recipes",
      tag: "Recipe",
      q: "salad",
      page: 2,
    });
    expect(parseBlogQuery({ category: "cars", tag: "Oil", page: "x" }, blogPosts)).toEqual({
      category: null,
      tag: null,
      q: "",
      page: 1,
    });
  });

  it("lists newest first and paginates", () => {
    const latest = getLatestPosts(blogPosts);
    expect(latest[0].publishedOn >= latest[1].publishedOn).toBe(true);
    const page = queryPosts(blogPosts, { category: null, tag: null, q: "", page: 1 }, 4);
    expect(page.items).toHaveLength(4);
    expect(page.pageCount).toBe(Math.ceil(latest.length / 4));
  });

  it("finds adjacent posts by date", () => {
    const [newest, second] = getLatestPosts(blogPosts);
    expect(getAdjacentPosts(blogPosts, newest.slug)).toEqual({ previous: second, next: undefined });
  });

  it("builds compact URLs", () => {
    expect(blogHref({ category: null, tag: null, q: "", page: 3 }, { category: "recipes" })).toBe("/blog?category=recipes");
  });
});
