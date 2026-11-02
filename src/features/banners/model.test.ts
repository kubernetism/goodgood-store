import { describe, expect, it } from "vitest";
import { bannerFormSchema, isSafeHref, pickActiveBanners, type BannerCandidate } from "./model";

const base: BannerCandidate = {
  id: "a",
  placement: "hero",
  title: "Hero",
  subtitle: "",
  image: null,
  ctaLabel: "",
  ctaHref: "",
  productSlug: null,
  endsAt: null,
  isActive: true,
  startsAt: null,
  sortOrder: 0,
  youtubeId: null,
};
const now = new Date("2026-11-01T12:00:00Z");

describe("pickActiveBanners", () => {
  it("picks the lowest sort order live banner per placement", () => {
    const result = pickActiveBanners(
      [
        { ...base, id: "second", sortOrder: 2 },
        { ...base, id: "first", sortOrder: 1 },
        { ...base, id: "bar", placement: "announcement" },
      ],
      now,
    );
    expect(result.hero?.id).toBe("first");
    expect(result.announcement?.id).toBe("bar");
    expect(result.deal).toBeNull();
  });

  it("skips inactive, not-yet-started and ended banners", () => {
    const result = pickActiveBanners(
      [
        { ...base, id: "off", isActive: false },
        { ...base, id: "future", startsAt: "2026-11-02T00:00:00Z" },
        { ...base, id: "ended", endsAt: "2026-11-01T12:00:00Z" },
        { ...base, id: "live", sortOrder: 9, startsAt: "2026-10-01T00:00:00Z", endsAt: "2026-12-01T00:00:00Z" },
      ],
      now,
    );
    expect(result.hero?.id).toBe("live");
  });

  it("picks one live pop-up with a video, by sort order within its dates", () => {
    const popup: BannerCandidate = { ...base, placement: "popup", youtubeId: "he8fKbFFot4" };
    const result = pickActiveBanners(
      [
        { ...popup, id: "later", sortOrder: 5 },
        { ...popup, id: "no-video", sortOrder: 0, youtubeId: null },
        { ...popup, id: "off", sortOrder: 0, isActive: false },
        { ...popup, id: "ended", sortOrder: 1, endsAt: "2026-10-31T00:00:00Z" },
        { ...popup, id: "future", sortOrder: 1, startsAt: "2026-11-05T00:00:00Z" },
        { ...popup, id: "live", sortOrder: 2, startsAt: "2026-10-01T00:00:00Z", endsAt: "2026-11-30T00:00:00Z" },
      ],
      now,
    );
    expect(result.popup?.id).toBe("live");
    expect(result.popup?.youtubeId).toBe("he8fKbFFot4");
    expect(result.hero).toBeNull();
  });

  it("returns no pop-up when none is live", () => {
    expect(pickActiveBanners([base], now).popup).toBeNull();
  });
});

describe("isSafeHref", () => {
  it.each(["/shop", "/shop?category=sidr", "https://wa.me/923000000000"])("allows %s", (href) => {
    expect(isSafeHref(href)).toBe(true);
  });
  it.each(["//evil.example", "/\\evil.example", "javascript:alert(1)", "http://insecure.example", "data:text/html,x", "shop"])(
    "refuses %s",
    (href) => {
      expect(isSafeHref(href)).toBe(false);
    },
  );
});

describe("bannerFormSchema", () => {
  const valid = {
    placement: "deal",
    title: " Eid gift box ",
    subtitle: "",
    ctaLabel: "Shop the box",
    ctaHref: "",
    imageId: "",
    productId: "7f1d2c3b-4a5e-4f60-8a7b-9c0d1e2f3a4b",
    isActive: "on",
    startsAt: "2026-11-01T09:00",
    endsAt: "2026-12-31T23:59",
    sortOrder: "0",
  };

  it("parses a valid deal, reading dates as Pakistan time", () => {
    const result = bannerFormSchema.parse(valid);
    expect(result.title).toBe("Eid gift box");
    expect(result.isActive).toBe(true);
    expect(result.imageId).toBeNull();
    expect(result.endsAt?.toISOString()).toBe("2026-12-31T18:59:00.000Z");
  });

  it("rejects an end before the start, a missing title and unsafe links", () => {
    const result = bannerFormSchema.safeParse({
      ...valid,
      title: "",
      endsAt: "2026-10-01T00:00",
      placement: "hero",
      ctaHref: "javascript:alert(1)",
    });
    expect(result.success).toBe(false);
    const paths = result.error?.issues.map((issue) => issue.path.join("."));
    expect(paths).toEqual(expect.arrayContaining(["title", "endsAt", "ctaHref"]));
  });

  it("drops a pasted video link from non-pop-up banners", () => {
    expect(bannerFormSchema.parse({ ...valid, youtubeId: "https://youtube.com/shorts/he8fKbFFot4" }).youtubeId).toBeNull();
  });

  it("treats a missing checkbox as inactive", () => {
    expect(bannerFormSchema.parse({ ...valid, isActive: undefined }).isActive).toBe(false);
  });
});

describe("bannerFormSchema for pop-ups", () => {
  const popup = {
    placement: "popup",
    title: "See our honey in action",
    subtitle: "",
    ctaLabel: "Shop honey",
    ctaHref: "/shop",
    imageId: "",
    productId: "",
    youtubeId: " https://youtube.com/shorts/he8fKbFFot4 ",
    isActive: "on",
    startsAt: "",
    endsAt: "",
    sortOrder: "0",
  };

  it("stores only the video id from a Shorts link", () => {
    const result = bannerFormSchema.parse(popup);
    expect(result.placement).toBe("popup");
    expect(result.youtubeId).toBe("he8fKbFFot4");
  });

  it("accepts watch and youtu.be links too", () => {
    expect(bannerFormSchema.parse({ ...popup, youtubeId: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }).youtubeId).toBe("dQw4w9WgXcQ");
    expect(bannerFormSchema.parse({ ...popup, youtubeId: "youtu.be/dQw4w9WgXcQ" }).youtubeId).toBe("dQw4w9WgXcQ");
  });

  it.each([
    ["", "Add a YouTube link for the pop-up video."],
    [undefined, "Add a YouTube link for the pop-up video."],
    ["https://vimeo.com/123456", "Enter a valid YouTube link, like https://youtube.com/shorts/…"],
    ["https://youtube.com/shorts/nope", "Enter a valid YouTube link, like https://youtube.com/shorts/…"],
  ])("refuses a pop-up with video link %j", (youtubeId, message) => {
    const result = bannerFormSchema.safeParse({ ...popup, youtubeId });
    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([expect.objectContaining({ path: ["youtubeId"], message })]);
  });

  it("still validates the shared button link", () => {
    const result = bannerFormSchema.safeParse({ ...popup, ctaHref: "javascript:alert(1)" });
    expect(result.error?.issues.map((issue) => issue.path.join("."))).toContain("ctaHref");
  });
});
