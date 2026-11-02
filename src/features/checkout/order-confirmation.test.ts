import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { formatPrice } from "@/lib/format";
import { CELEBRATED_ORDER_KEY } from "./celebration";
import { PlaceOrderButton } from "./checkout-summary";
import { OrderConfirmation } from "./order-confirmation";

const state = { status: "success", orderNumber: "AS-1042", total: 325000, phone: "+923001234567", itemCount: 2 } as const;

function renderConfirmation(overrides: Partial<typeof state> & { whatsappUrl?: string } = {}) {
  return renderToStaticMarkup(createElement(OrderConfirmation, { state: { ...state, ...overrides } }));
}

describe("order confirmation", () => {
  afterEach(() => { vi.unstubAllGlobals(); });

  it("celebrates a new order and keeps the receipt content", () => {
    const html = renderConfirmation();
    expect(html).toContain('data-celebrate="play"');
    expect(html).toContain("hc--celebrate hc--play");
    expect(html).toContain('class="hc-sparks"');
    expect(html).toMatch(/<h2[^>]*tabindex="-1"[^>]*>Thank you for your purchase<\/h2>/);
    expect(html).toContain("AS-1042");
    expect(html).toContain(formatPrice(325000));
    expect(html).toContain('href="/track-order?order=AS-1042"');
    expect(html).toContain("Track this order");
    expect(html).toContain("Continue shopping");
  });

  it("keeps the WhatsApp button when the order went to WhatsApp", () => {
    const html = renderConfirmation({ whatsappUrl: "https://wa.me/923001234567?text=Order" });
    expect(html).toContain("Open order in WhatsApp");
  });

  it("shows the resting comb, without sparks, once this order has been celebrated", () => {
    vi.stubGlobal("window", { sessionStorage: { getItem: (key: string) => (key === CELEBRATED_ORDER_KEY ? "AS-1042" : null), setItem: () => {} } });
    const html = renderConfirmation();
    expect(html).toContain('data-celebrate="rest"');
    expect(html).not.toContain("hc--play");
    expect(html).not.toContain("hc-spark");
    expect(html).toContain("hc__tick");
    expect(html).toContain("Thank you for your purchase");
  });

  it("still celebrates when session storage is blocked", () => {
    vi.stubGlobal("window", { get sessionStorage(): Storage { throw new Error("SecurityError"); } });
    expect(renderConfirmation()).toContain('data-celebrate="play"');
  });
});

describe("Place order button", () => {
  it("shows the ink comb instead of a spinner while the order is placed", () => {
    const html = renderToStaticMarkup(createElement(PlaceOrderButton, { id: "place-order", total: 325000, pending: true, blocked: false }));
    expect(html).toContain("Placing your order…");
    expect(html).toContain("hc--loader hc--ink");
    expect(html).not.toContain("animate-spin");
  });

  it("shows the total and no comb when idle", () => {
    const html = renderToStaticMarkup(createElement(PlaceOrderButton, { id: "place-order", total: 325000, pending: false, blocked: false }));
    expect(html).toContain("Place order");
    expect(html).toContain(formatPrice(325000));
    expect(html).not.toContain("hc--loader");
  });
});
