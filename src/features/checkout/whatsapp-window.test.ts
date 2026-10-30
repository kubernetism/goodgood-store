import { afterEach, describe, expect, it, vi } from "vitest";
import { finishOrderWhatsappWindow, openOrderWhatsappWindow } from "./whatsapp-window";

function makePopup(href = "about:blank") {
  return { closed: false, opener: {}, document: { title: "", body: { textContent: "" } }, location: { href, replace: vi.fn() }, close: vi.fn() };
}

describe("checkout WhatsApp window", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("opens a waiting tab and navigates it after the order succeeds", () => {
    const popup = makePopup();
    vi.stubGlobal("window", { open: vi.fn(() => popup) });
    const handle = openOrderWhatsappWindow();
    expect(popup.document.body.textContent).toContain("Please wait");
    finishOrderWhatsappWindow(handle, "https://wa.me/123?text=order");
    expect(popup.location.replace).toHaveBeenCalledWith("https://wa.me/123?text=order");
    expect(popup.opener).toBeNull();
  });

  it("closes the waiting tab after an unsuccessful order", () => {
    const popup = makePopup();
    finishOrderWhatsappWindow(popup as unknown as Window);
    expect(popup.close).toHaveBeenCalledOnce();
  });

  it("leaves a tab alone if the customer navigated it elsewhere", () => {
    const popup = makePopup("https://example.org/");
    finishOrderWhatsappWindow(popup as unknown as Window, "https://wa.me/123?text=order");
    expect(popup.location.replace).not.toHaveBeenCalled();
    expect(popup.close).not.toHaveBeenCalled();
  });

  it("handles a blocked popup without interrupting checkout", () => {
    vi.stubGlobal("window", { open: () => null });
    expect(openOrderWhatsappWindow()).toBeNull();
    expect(() => finishOrderWhatsappWindow(null, "https://wa.me/123?text=order")).not.toThrow();
  });
});
