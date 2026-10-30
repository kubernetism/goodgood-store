import { describe, expect, it } from "vitest";
import { normalizeWhatsappNumber } from "./whatsapp-settings";

describe("WhatsApp notification number", () => {
  it("normalizes Pakistani and international numbers", () => {
    expect(normalizeWhatsappNumber("0311-9000985")).toBe("+923119000985");
    expect(normalizeWhatsappNumber("0092 311 9000985")).toBe("+923119000985");
    expect(normalizeWhatsappNumber("+1 (202) 555-0123")).toBe("+12025550123");
  });
  it("rejects incomplete and ambiguous numbers", () => {
    expect(normalizeWhatsappNumber("12345")).toBeNull();
    expect(normalizeWhatsappNumber("+00 1234")).toBeNull();
    expect(normalizeWhatsappNumber("abc")).toBeNull();
  });
});
