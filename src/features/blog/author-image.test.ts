import { describe, expect, it } from "vitest";
import { blogAuthorImage } from "./author-image";

const team = { url: "/team.jpg", alt: "Team portrait", width: 100, height: 100 };
const blog = { url: "/blog.jpg", alt: "Blog portrait", width: 100, height: 100 };
describe("blog author portrait", () => {
  it("uses the author's team portrait when no blog photo has been assigned", () => {
    expect(blogAuthorImage({ "about.member.sana-malik": { image: team, youtubeId: null } })).toEqual(team);
  });
  it("prefers an explicitly assigned blog photo", () => {
    expect(blogAuthorImage({ "about.member.sana-malik": { image: team, youtubeId: null }, "blog.author": { image: blog, youtubeId: null } })).toEqual(blog);
  });
  it("leaves the placeholder when neither portrait exists", () => expect(blogAuthorImage({})).toBeNull());
});
