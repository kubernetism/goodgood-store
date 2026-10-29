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

  it("treats a missing checkbox as inactive", () => {
    expect(bannerFormSchema.parse({ ...valid, isActive: undefined }).isActive).toBe(false);
  });
});
