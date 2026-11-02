import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const form = vi.hoisted(() => ({ pending: false }));
vi.mock("./actions", () => ({ sendContactMessage: vi.fn() }));
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, useActionState: (_action: unknown, initial: unknown) => [initial, () => {}, form.pending] };
});
import { ContactForm } from "./contact-form";

const props = { whatsappHref: null, call: { href: "tel:+923001234567", display: "0300 1234567" } };

describe("contact form sending state", () => {
  beforeEach(() => { form.pending = false; });

  it("shows the ink comb in the send button and announces sending once", () => {
    form.pending = true;
    const html = renderToStaticMarkup(createElement(ContactForm, props));
    expect(html).toContain("Sending…");
    expect(html).toContain("hc--loader hc--ink");
    expect(html).not.toContain("animate-spin");
    expect(html.match(/Sending your message/g)).toHaveLength(1);
    expect(html).not.toContain('role="status"');
  });

  it("shows the send icon when idle", () => {
    const html = renderToStaticMarkup(createElement(ContactForm, props));
    expect(html).toContain("Send message");
    expect(html).not.toContain("hc--loader");
  });
});
