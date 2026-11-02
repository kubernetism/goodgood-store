import { describe, expect, it } from "vitest";
import { siteConfig } from "@/lib/site";
import {
  formatWhatsappNumber,
  googleMapsDirectionsUrl,
  googleMapsSearchUrl,
  mapsQuery,
  whatsappContactLink,
  whatsappGreeting,
} from "./contact-routes";
import { contactServices } from "./validation";

describe("contact route links", () => {
  it("builds an encoded Google Maps search link for the shop", () => {
    const query = mapsQuery(siteConfig.contact.businessName, siteConfig.contact.shortAddress);
    expect(query).toBe("Abdul Sami Honey Enterprises, Main GT Road, Peshawar");
    const url = new URL(googleMapsSearchUrl(query));
    expect(url.origin + url.pathname).toBe("https://www.google.com/maps/search/");
    expect(url.searchParams.get("api")).toBe("1");
    expect(url.searchParams.get("query")).toBe(query);
  });

  it("builds a directions link with the address as the destination", () => {
    const url = new URL(googleMapsDirectionsUrl("Usman Tower, Main GT Road & Peshawar"));
    expect(url.pathname).toBe("/maps/dir/");
    expect(url.searchParams.get("destination")).toBe("Usman Tower, Main GT Road & Peshawar");
  });

  it("prefills a WhatsApp message that names the chosen topic", () => {
    expect(whatsappGreeting()).toBe("Assalam-o-Alaikum! I have a question about Abdul Sami Honey.");
    expect(whatsappGreeting("bulk-orders")).toContain("wholesale and bulk honey");
    for (const { value } of contactServices) expect(whatsappGreeting(value)).toMatch(/^Assalam-o-Alaikum! .+\.$/);
  });

  it("links local and international numbers to wa.me with the encoded greeting", () => {
    const link = whatsappContactLink("0300 1234567", "gift-boxes");
    expect(link).not.toBeNull();
    const url = new URL(link ?? "");
    expect(url.origin + url.pathname).toBe("https://wa.me/923001234567");
    expect(url.searchParams.get("text")).toBe(whatsappGreeting("gift-boxes"));
    expect(whatsappContactLink("+92 315 9021627")).toMatch(/^https:\/\/wa\.me\/923159021627\?text=/);
  });

  it("displays Pakistani WhatsApp numbers in a readable grouping", () => {
    expect(formatWhatsappNumber("03001234567")).toBe("+92 300 1234567");
    expect(formatWhatsappNumber("+92 (300) 123-4567")).toBe("+92 300 1234567");
    expect(formatWhatsappNumber("+971501234567")).toBe("+971501234567");
    expect(formatWhatsappNumber("hello")).toBeNull();
  });

  it("returns null when no usable WhatsApp number is set", () => {
    expect(whatsappContactLink(null)).toBeNull();
    expect(whatsappContactLink("")).toBeNull();
    expect(whatsappContactLink("12")).toBeNull();
  });

});
