import { readFileSync } from "node:fs";
import { createElement, Fragment } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HoneycombLoader, HoneycombMark, HoneycombSparks } from "./honeycomb-mark";

const count = (html: string, pattern: RegExp) => html.match(pattern)?.length ?? 0;

describe("HoneycombMark", () => {
  it("renders a decorative seven-cell comb at the requested size", () => {
    const html = renderToStaticMarkup(createElement(HoneycombMark, { size: 64 }));
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('width="64"');
    expect(count(html, /transform="translate\(/g)).toBe(7);
    expect(count(html, /class="hc__outline"/g)).toBe(7);
    expect(html).toContain("hc--loader");
    expect(html).not.toContain("hc__tick");
  });

  it("defines the cell and wave shapes once and reuses them in every cell", () => {
    const html = renderToStaticMarkup(createElement(HoneycombMark));
    expect(count(html, /<polygon /g)).toBe(1);
    expect(count(html, / d="M -60/g)).toBe(1);
    const hexId = html.match(/<polygon id="([^"]+)"/)?.[1];
    const waveId = html.match(/<path id="([^"]+)"/)?.[1];
    expect(count(html, new RegExp(`href="#${hexId}"`, "g"))).toBe(15); // clip + wax and outline per cell
    expect(count(html, new RegExp(`href="#${waveId}"`, "g"))).toBe(7);
  });

  it("gives every comb on a page its own clip-path and gradient ids", () => {
    const html = renderToStaticMarkup(createElement(Fragment, null, createElement(HoneycombMark), createElement(HoneycombMark)));
    const clipIds = [...html.matchAll(/<clipPath id="([^"]+)"/g)].map((match) => match[1]);
    const gradientIds = [...html.matchAll(/<linearGradient id="([^"]+)"/g)].map((match) => match[1]);
    expect(clipIds).toHaveLength(2);
    expect(new Set(clipIds).size).toBe(2);
    expect(new Set(gradientIds).size).toBe(2);
    for (const id of clipIds) {
      expect(id).toMatch(/^[\w-]+$/);
      expect(html).toContain(`url(#${id})`);
    }
  });

  it("draws in currentColor without a gradient for the ink tone (honey buttons)", () => {
    const html = renderToStaticMarkup(createElement(HoneycombMark, { tone: "ink", size: 22 }));
    expect(html).toContain("hc--ink");
    expect(html).not.toContain("linearGradient");
    expect(html).toContain('fill="currentColor"');
  });

  it("seals the celebration comb with a tick and a drop, animating only while playing", () => {
    const playing = renderToStaticMarkup(createElement(HoneycombMark, { variant: "celebrate" }));
    expect(playing).toContain("hc--celebrate");
    expect(playing).toContain("hc--play");
    expect(playing).toContain("hc__tick");
    expect(playing).toContain("hc__drop");
    expect(playing).toContain("animation-delay:500ms");
    expect(count(playing, /class="hc__cell"/g)).toBe(7);

    const resting = renderToStaticMarkup(createElement(HoneycombMark, { variant: "celebrate", playing: false }));
    expect(resting).not.toContain("hc--play");
    expect(resting).toContain("hc__tick");
  });
});

describe("HoneycombLoader", () => {
  it("is a single status message with a hidden label by default, delayed so fast loads never flash it", () => {
    const html = renderToStaticMarkup(createElement(HoneycombLoader));
    expect(count(html, /role="status"/g)).toBe(1);
    expect(html).toContain('<span class="sr-only">Loading…</span>');
    expect(html).toContain("hc-status--delayed");
  });

  it("can show its label and appear at once", () => {
    const html = renderToStaticMarkup(createElement(HoneycombLoader, { label: "Loading products…", showLabel: true, delayed: false }));
    expect(html).toContain("Loading products…");
    expect(html).not.toContain("sr-only");
    expect(html).not.toContain("hc-status--delayed");
  });
});

describe("HoneycombSparks", () => {
  it("renders decorative sparks with fixed positions (same markup on server and client)", () => {
    const first = renderToStaticMarkup(createElement(HoneycombSparks));
    expect(first).toBe(renderToStaticMarkup(createElement(HoneycombSparks)));
    expect(first).toContain('aria-hidden="true"');
    expect(count(first, /class="hc-spark"/g)).toBe(14);
  });
});

describe("honeycomb CSS", () => {
  const css = readFileSync(new URL("./honeycomb-mark.css", import.meta.url), "utf8");
  const reduced = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));

  it("shows a still, filled comb with a static tick and no drop or sparks for reduced motion", () => {
    expect(reduced).toMatch(/\.hc \*,\s*\.hc-rise \{\s*animation: none !important;/);
    expect(reduced).toMatch(/\.hc__drop,\s*\.hc-sparks \{\s*display: none;/);
    // The tick is drawn by default; only the play animation hides it first.
    expect(css).toMatch(/\.hc__tick \{[^}]*stroke-dasharray: 60;/);
    expect(css).not.toMatch(/\.hc__tick \{[^}]*stroke-dashoffset/);
  });

  it("animates transform and opacity only", () => {
    const animated = [...css.matchAll(/@keyframes [\w-]+ \{([\s\S]*?)\n\}/g)].map((match) => match[1]!);
    const properties = new Set(animated.flatMap((body) => [...body.matchAll(/([a-z-]+):/g)].map((match) => match[1])));
    expect([...properties].sort()).toEqual(["opacity", "stroke-dashoffset", "transform"]);
  });
});
