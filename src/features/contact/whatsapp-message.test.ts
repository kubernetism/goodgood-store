import { describe, expect, it } from "vitest";
import { WHATSAPP_GREETING, isProductPath, whatsappMessage, withWhatsappText } from "./whatsapp-message";

describe("floating WhatsApp message", () => {
  it("recognises product pages only", () => {
    expect(isProductPath("/shop/sidr-honey-500g")).toBe(true);
    expect(isProductPath("/shop/sidr-honey-500g/")).toBe(true);
    expect(isProductPath("/shop")).toBe(false);
    expect(isProductPath("/shop/")).toBe(false);
    expect(isProductPath("/shop/a/b")).toBe(false);
    expect(isProductPath("/cart")).toBe(false);
  });

  it("uses the general greeting without a product", () => {
    expect(whatsappMessage()).toBe(WHATSAPP_GREETING);
    expect(whatsappMessage(null)).toBe(WHATSAPP_GREETING);
    expect(whatsappMessage({ name: "   ", url: "https://example.com/shop/x" })).toBe(WHATSAPP_GREETING);
  });

  it("names and links the product when known", () => {
    expect(whatsappMessage({ name: " Sidr (Beri) Honey ", url: "https://example.com/shop/sidr" })).toBe(
      "Assalam o Alaikum! I'd like to know more about Sidr (Beri) Honey: https://example.com/shop/sidr",
    );
  });

  it("URL-encodes the prefilled text", () => {
    expect(withWhatsappText("https://wa.me/923001234567", "Hi & bye?")).toBe("https://wa.me/923001234567?text=Hi%20%26%20bye%3F");
  });
});
