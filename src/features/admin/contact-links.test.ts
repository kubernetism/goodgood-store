import { describe, expect, it } from "vitest";
import { telHref, waLink } from "./contact-links";

describe("contact links", () => {
  it("builds tel: links from formatted numbers", () => {
    expect(telHref("+92 300 1234567")).toBe("tel:+923001234567");
    expect(telHref("0300-1234567")).toBe("tel:03001234567");
    expect(telHref("call me")).toBeNull();
  });
  it("normalises local Pakistani mobiles for WhatsApp", () => {
    expect(waLink("03001234567")).toBe("https://wa.me/923001234567");
    expect(waLink("+92 300 1234567")).toBe("https://wa.me/923001234567");
    expect(waLink("0092 300 1234567")).toBe("https://wa.me/923001234567");
  });
  it("keeps international numbers and rejects unusable ones", () => {
    expect(waLink("+44 7700 900123")).toBe("https://wa.me/447700900123");
    expect(waLink("12345")).toBeNull();
  });
  it("encodes an optional message", () => {
    expect(waLink("03001234567", "Order AS-1001 & more")).toBe("https://wa.me/923001234567?text=Order%20AS-1001%20%26%20more");
  });
});
