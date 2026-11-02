import { describe, expect, it } from "vitest";
import { parseYouTubeUrl, youtubeEmbedUrl, youtubeThumbnailUrl } from "./youtube";

const ID = "dQw4w9WgXcQ";

describe("parseYouTubeUrl", () => {
  it.each([
    [`https://www.youtube.com/watch?v=${ID}`],
    [`https://youtube.com/watch?v=${ID}&list=PL123&index=2`],
    [`http://m.youtube.com/watch?v=${ID}`],
    [`https://youtu.be/${ID}`],
    [`https://youtu.be/${ID}?si=abcdef`],
    [`https://www.youtube.com/embed/${ID}`],
    [`https://www.youtube-nocookie.com/embed/${ID}`],
    [`https://www.youtube.com/shorts/${ID}`],
    [`https://www.youtube.com/shorts/${ID}?feature=share`],
    [`youtube.com/shorts/${ID}`],
    [`https://m.youtube.com/shorts/${ID}?si=abc123`],
    [`https://www.youtube.com/live/${ID}?feature=share`],
    [`youtube.com/watch?v=${ID}`],
    [`  ${ID}  `],
  ])("extracts the id from %s", (input) => {
    expect(parseYouTubeUrl(input)?.id).toBe(ID);
  });

  it("reads the id from the shop's YouTube Shorts link", () => {
    expect(parseYouTubeUrl("https://youtube.com/shorts/he8fKbFFot4")).toEqual({ id: "he8fKbFFot4", start: null });
  });

  it("rejects a shorts URL without a valid id", () => {
    expect(parseYouTubeUrl("https://youtube.com/shorts/")).toBeNull();
    expect(parseYouTubeUrl("https://youtube.com/shorts/tooShort")).toBeNull();
  });

  it("reads start times in seconds or h/m/s form", () => {
    expect(parseYouTubeUrl(`https://youtu.be/${ID}?t=90`)?.start).toBe(90);
    expect(parseYouTubeUrl(`https://www.youtube.com/watch?v=${ID}&t=1m30s`)?.start).toBe(90);
    expect(parseYouTubeUrl(`https://www.youtube.com/embed/${ID}?start=12`)?.start).toBe(12);
    expect(parseYouTubeUrl(`https://youtu.be/${ID}`)?.start).toBeNull();
  });

  it.each([
    [""],
    ["not a url"],
    ["https://vimeo.com/123456"],
    [`https://evil.example/watch?v=${ID}`],
    [`https://youtube.com.evil.example/watch?v=${ID}`],
    ["https://www.youtube.com/watch?v=short"],
    ["https://www.youtube.com/watch?v=<script>alert</script>"],
    ["https://www.youtube.com/channel/UC123"],
    [`javascript:alert(1)//youtu.be/${ID}`],
  ])("rejects %s", (input) => {
    expect(parseYouTubeUrl(input)).toBeNull();
  });
});

describe("youtube URLs", () => {
  it("embeds through the privacy-enhanced domain", () => {
    const url = new URL(youtubeEmbedUrl({ id: ID, start: 30 }));
    expect(url.origin).toBe("https://www.youtube-nocookie.com");
    expect(url.pathname).toBe(`/embed/${ID}`);
    expect(url.searchParams.get("start")).toBe("30");
    expect(url.searchParams.get("autoplay")).toBe("1");
  });

  it("mutes only when asked, so autoplay is allowed without a click", () => {
    const muted = new URL(youtubeEmbedUrl({ id: ID, start: null }, { autoplay: true, mute: true }));
    expect(muted.searchParams.get("mute")).toBe("1");
    expect(muted.searchParams.get("playsinline")).toBe("1");
    const still = new URL(youtubeEmbedUrl({ id: ID, start: null }, { autoplay: false }));
    expect(still.searchParams.has("autoplay")).toBe(false);
    expect(still.searchParams.has("mute")).toBe(false);
  });

  it("builds the thumbnail URL", () => {
    expect(youtubeThumbnailUrl(ID)).toBe(`https://i.ytimg.com/vi/${ID}/hqdefault.jpg`);
  });
});
