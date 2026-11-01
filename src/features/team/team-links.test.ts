import { describe, expect, it } from "vitest";
import { teamMemberLinks, type TeamLinkFields } from "./team-links";

const empty: TeamLinkFields = { name: "Salman Sami", email: null, phone: null, phoneOnWhatsapp: false, facebookUrl: null, instagramUrl: null, linkedinUrl: null, xUrl: null };

describe("teamMemberLinks", () => {
  it("returns nothing when no contact details are set", () => {
    expect(teamMemberLinks(empty)).toEqual([]);
  });

  it("links only the fields that are set, in a fixed order", () => {
    const links = teamMemberLinks({ ...empty, email: "salman@example.com", phone: "+923119000985", phoneOnWhatsapp: true, linkedinUrl: "https://linkedin.com/in/salman" });
    expect(links.map((link) => link.kind)).toEqual(["email", "phone", "whatsapp", "linkedin"]);
    expect(links.map((link) => link.href)).toEqual(["mailto:salman@example.com", "tel:+923119000985", "https://wa.me/923119000985", "https://linkedin.com/in/salman"]);
    expect(links[3]).toMatchObject({ label: "Salman Sami on LinkedIn", external: true });
    expect(links[0]?.external).toBe(false);
  });

  it("shows WhatsApp only when the number is marked as on WhatsApp", () => {
    expect(teamMemberLinks({ ...empty, phone: "+923119000985" }).map((link) => link.kind)).toEqual(["phone"]);
  });

  it("never links a non-https profile", () => {
    expect(teamMemberLinks({ ...empty, facebookUrl: "javascript:alert(1)", xUrl: "http://x.com/a" })).toEqual([]);
  });
});
