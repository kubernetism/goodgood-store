import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const form = vi.hoisted(() => ({ pending: false }));
vi.mock("./actions", () => ({ subscribeToNewsletter: vi.fn() }));
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, useActionState: (_action: unknown, initial: unknown) => [initial, () => {}, form.pending] };
});
import { NewsletterForm } from "./newsletter-form";

describe("newsletter submit", () => {
  beforeEach(() => { form.pending = false; });

  it("swaps the send icon for the ink comb in the compact form", () => {
    form.pending = true;
    const html = renderToStaticMarkup(createElement(NewsletterForm, { variant: "compact" }));
    expect(html).toContain("hc--loader hc--ink");
    expect(html).toContain('<span class="sr-only">Subscribing</span>');
    expect(html).not.toContain("lucide-send");
  });

  it("adds the ink comb beside the label in the wide form", () => {
    form.pending = true;
    const html = renderToStaticMarkup(createElement(NewsletterForm, { variant: "wide" }));
    expect(html).toContain("hc--loader hc--ink");
    expect(html).toContain("Subscribing…");
  });

  it("shows no comb when idle", () => {
    const html = renderToStaticMarkup(createElement(NewsletterForm, { variant: "wide" }));
    expect(html).toContain("Subscribe");
    expect(html).not.toContain("hc--loader");
  });
});
