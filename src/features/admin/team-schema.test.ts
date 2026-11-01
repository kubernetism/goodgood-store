import { describe, expect, it } from "vitest";
import { normalizePhone, normalizeProfileUrl, teamMemberFormSchema } from "./team-schema";

const photoId = "7f1d2c3b-4a5e-4f60-8a7b-9c0d1e2f3a4b";
const input = {
  name: "  Salman Sami ",
  role: "Founder",
  bio: "",
  photoId: "",
  email: "",
  phone: "",
  phoneOnWhatsapp: false,
  facebookUrl: "",
  instagramUrl: "",
  linkedinUrl: "",
  xUrl: "",
  isPublished: true,
};

describe("team member form", () => {
  it("trims text and stores empty optional fields as null", () => {
    expect(teamMemberFormSchema.parse(input)).toEqual({
      ...input,
      name: "Salman Sami",
      photoId: null,
      email: null,
      phone: null,
      facebookUrl: null,
      instagramUrl: null,
      linkedinUrl: null,
      xUrl: null,
    });
  });

  it("normalizes contact details and profile links", () => {
    const parsed = teamMemberFormSchema.parse({
      ...input,
      photoId,
      email: " Salman@AbdulSamiEnterprises.com ",
      phone: "0311-9000985",
      phoneOnWhatsapp: true,
      facebookUrl: "facebook.com/abdulsami.honey",
      instagramUrl: "http://www.instagram.com/abdulsami/",
      linkedinUrl: "https://pk.linkedin.com/in/salman#about",
      xUrl: "https://twitter.com/abdulsami",
    });
    expect(parsed).toMatchObject({
      photoId,
      email: "salman@abdulsamienterprises.com",
      phone: "+923119000985",
      phoneOnWhatsapp: true,
      facebookUrl: "https://facebook.com/abdulsami.honey",
      instagramUrl: "https://www.instagram.com/abdulsami/",
      linkedinUrl: "https://pk.linkedin.com/in/salman",
      xUrl: "https://twitter.com/abdulsami",
    });
  });

  it("drops the WhatsApp flag when there is no phone number", () => {
    expect(teamMemberFormSchema.parse({ ...input, phoneOnWhatsapp: true }).phoneOnWhatsapp).toBe(false);
  });

  it.each([
    ["blank name", { name: "   " }, "Name is required."],
    ["blank role", { role: "" }, "Role or title is required."],
    ["long bio", { bio: "a".repeat(601) }, "600 characters"],
    ["bad photo id", { photoId: "not-a-uuid" }, "Choose the photo again."],
    ["bad email", { email: "salman@" }, "valid email"],
    ["bad phone", { phone: "12345" }, "valid phone"],
    ["link to another site", { facebookUrl: "https://evil.example/facebook.com" }, "Facebook profile link"],
    ["look-alike host", { instagramUrl: "https://instagram.com.evil.example/a" }, "Instagram profile link"],
    ["script URL", { linkedinUrl: "javascript:alert(1)" }, "LinkedIn profile link"],
    ["wrong network", { xUrl: "https://facebook.com/someone" }, "X (Twitter) profile link"],
  ])("rejects a %s", (_case, change, message) => {
    const result = teamMemberFormSchema.safeParse({ ...input, ...change });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain(message);
  });
});

describe("normalizeProfileUrl", () => {
  const hosts = ["facebook.com", "fb.com"];
  it("accepts the network and its subdomains over https only", () => {
    expect(normalizeProfileUrl("https://m.facebook.com/page", hosts)).toBe("https://m.facebook.com/page");
    expect(normalizeProfileUrl("fb.com/page", hosts)).toBe("https://fb.com/page");
    expect(normalizeProfileUrl("ftp://facebook.com/page", hosts)).toBeNull();
    expect(normalizeProfileUrl("https://user:pw@facebook.com/page", hosts)).toBeNull();
    expect(normalizeProfileUrl("https://facebook.com:8443/page", hosts)).toBeNull();
    expect(normalizeProfileUrl("https://notfacebook.com/page", hosts)).toBeNull();
    expect(normalizeProfileUrl("facebook .com/page", hosts)).toBeNull();
  });
});

describe("normalizePhone", () => {
  it("stores Pakistani mobiles, landlines and international numbers in E.164", () => {
    expect(normalizePhone("0300 1234567")).toBe("+923001234567");
    expect(normalizePhone("+92 300 1234567")).toBe("+923001234567");
    expect(normalizePhone("091-2345678")).toBe("+92912345678");
    expect(normalizePhone("+44 20 7946 0958")).toBe("+442079460958");
    expect(normalizePhone("0300")).toBeNull();
    expect(normalizePhone("call me")).toBeNull();
  });
});
