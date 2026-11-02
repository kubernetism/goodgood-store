import { describe, expect, it } from "vitest";
import { normalizeSiteSocialUrl, parseSocialLinksForm, resolveSiteSocialLinks } from "./site-socials";

const placeholders = [
  { network: "facebook", href: "https://facebook.com" },
  { network: "instagram", href: "https://instagram.com/" },
  { network: "youtube", href: "https://youtube.com" },
  { network: "x", href: "https://x.com" },
];

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

describe("normalizeSiteSocialUrl", () => {
  it("accepts profile links on the right network, upgraded to https", () => {
    expect(normalizeSiteSocialUrl("youtube", "youtube.com/@abdulsamihoney")).toBe("https://youtube.com/@abdulsamihoney");
    expect(normalizeSiteSocialUrl("youtube", "https://m.youtube.com/channel/UC123")).toBe("https://m.youtube.com/channel/UC123");
    expect(normalizeSiteSocialUrl("tiktok", "http://www.tiktok.com/@abdulsami")).toBe("https://www.tiktok.com/@abdulsami");
    expect(normalizeSiteSocialUrl("x", "https://twitter.com/abdulsami")).toBe("https://twitter.com/abdulsami");
    expect(normalizeSiteSocialUrl("whatsapp", "https://whatsapp.com/channel/0029VaAbc")).toBe("https://whatsapp.com/channel/0029VaAbc");
  });

  it.each([
    ["facebook", "https://facebook.com", "bare home page"],
    ["instagram", "https://www.instagram.com/", "bare home page"],
    ["tiktok", "https://youtube.com/@abdulsami", "wrong network"],
    ["youtube", "https://youtube.com.evil.example/@a", "look-alike domain"],
    ["youtube", "https://youtu.be/abc", "video short link"],
    ["linkedin", "javascript:alert(1)", "script URL"],
    ["facebook", "https://facebook.com:8443/page", "custom port"],
    ["whatsapp", "https://whatsapp.com/abc", "not a channel"],
    ["whatsapp", "https://wa.me/923001234567", "chat link, not a channel"],
  ] as const)("rejects %s %s (%s)", (network, input, reason) => {
    expect(normalizeSiteSocialUrl(network, input), reason).toBeNull();
  });
});

describe("parseSocialLinksForm", () => {
  it("keeps filled networks with their Show switch and drops empty ones", () => {
    const result = parseSocialLinksForm(form({ facebookUrl: "facebook.com/abdulsamihoney", facebookVisible: "yes", tiktokUrl: "https://tiktok.com/@abdulsami", instagramUrl: "  " }));
    expect(result).toEqual({
      ok: true,
      links: {
        facebook: { url: "https://facebook.com/abdulsamihoney", visible: true },
        tiktok: { url: "https://tiktok.com/@abdulsami", visible: false },
      },
    });
  });

  it("names the network whose link is invalid", () => {
    expect(parseSocialLinksForm(form({ instagramUrl: "https://evil.example/instagram" }))).toEqual({ ok: false, error: expect.stringContaining("valid Instagram link") });
    expect(parseSocialLinksForm(form({ whatsappUrl: "https://wa.me/923001234567" }))).toEqual({ ok: false, error: expect.stringContaining("WhatsApp channel") });
    expect(parseSocialLinksForm(form({ xUrl: `https://x.com/${"a".repeat(300)}` }))).toEqual({ ok: false, error: expect.stringContaining("too long") });
  });
});

describe("resolveSiteSocialLinks", () => {
  it("falls back to site config when never saved, skipping placeholder home pages", () => {
    expect(resolveSiteSocialLinks(null, placeholders)).toEqual([]);
    expect(resolveSiteSocialLinks(undefined, [...placeholders, { network: "instagram", href: "https://instagram.com/abdulsami" }])).toEqual([
      { network: "instagram", label: "Instagram", href: "https://instagram.com/abdulsami" },
    ]);
  });

  it("uses saved links only (never the fallback), visible ones, in network order", () => {
    const stored = {
      x: { url: "https://x.com/abdulsami", visible: true },
      facebook: { url: "https://facebook.com/abdulsamihoney", visible: true },
      youtube: { url: "https://youtube.com/@abdulsami", visible: false },
    };
    expect(resolveSiteSocialLinks(stored, [{ network: "instagram", href: "https://instagram.com/abdulsami" }])).toEqual([
      { network: "facebook", label: "Facebook", href: "https://facebook.com/abdulsamihoney" },
      { network: "x", label: "X (Twitter)", href: "https://x.com/abdulsami" },
    ]);
    expect(resolveSiteSocialLinks({}, [{ network: "instagram", href: "https://instagram.com/abdulsami" }])).toEqual([]);
  });

  it("skips malformed or unsafe stored values instead of showing them", () => {
    const stored = {
      facebook: { url: "javascript:alert(1)", visible: true },
      instagram: { url: "https://instagram.com/abdulsami" },
      tiktok: "https://tiktok.com/@a",
      linkedin: { url: "https://linkedin.com/company/abdul-sami", visible: true },
      myspace: { url: "https://myspace.com/a", visible: true },
    };
    expect(resolveSiteSocialLinks(stored, [])).toEqual([{ network: "linkedin", label: "LinkedIn", href: "https://linkedin.com/company/abdul-sami" }]);
    expect(resolveSiteSocialLinks(["nope"], [])).toEqual([]);
  });
});
