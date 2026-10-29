import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SlidingRow } from "./sliding-row";

const preference = vi.hoisted(() => ({ reduced: false }));
vi.mock("@/lib/use-prefers-reduced-motion", () => ({ usePrefersReducedMotion: () => preference.reduced }));

const items = [
  { key: "one", content: createElement("a", { href: "/one" }, "First card") },
  { key: "two", content: createElement("a", { href: "/two" }, "Second card") },
];

describe("SlidingRow accessibility", () => {
  beforeEach(() => { preference.reduced = false; });

  it("renders one accessible copy of each card and a pause control", () => {
    const html = renderToStaticMarkup(createElement(SlidingRow, { label: "Featured products", items }));
    expect(html.match(/href="\/one"/g)).toHaveLength(1);
    expect(html.match(/href="\/two"/g)).toHaveLength(1);
    expect(html).toContain('aria-label="Pause featured products"');
    expect(html).toContain('aria-roledescription="carousel"');
  });

  it("keeps manual controls and omits autoplay for reduced motion", () => {
    preference.reduced = true;
    const html = renderToStaticMarkup(createElement(SlidingRow, { label: "Reviews", items }));
    expect(html).not.toContain('aria-label="Pause reviews"');
    expect(html).not.toContain('data-enhanced="true"');
    expect(html).toContain('aria-label="Previous reviews"');
    expect(html).toContain('aria-label="Next reviews"');
  });

  it("supports full-width rows without changing the default product layout", () => {
    const html = renderToStaticMarkup(createElement(SlidingRow, { label: "Reviews", items, fullWidth: true }));
    expect(html).toContain("sliding-row--full-width");
  });

  it("does not offer looping controls for a single card", () => {
    const html = renderToStaticMarkup(createElement(SlidingRow, { label: "One product", items: items.slice(0, 1) }));
    expect(html).not.toContain("sliding-row__control");
  });
});
