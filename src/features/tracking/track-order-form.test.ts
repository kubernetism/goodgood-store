import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const form = vi.hoisted(() => ({ pending: false }));
vi.mock("./actions", () => ({ trackOrder: vi.fn() }));
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, useActionState: (_action: unknown, initial: unknown) => [initial, () => {}, form.pending] };
});
import { TrackOrderForm } from "./track-order-form";

describe("track order lookup", () => {
  beforeEach(() => { form.pending = false; });

  it("shows the ink comb in the button and the honey comb in the result panel while looking up", () => {
    form.pending = true;
    const html = renderToStaticMarkup(createElement(TrackOrderForm, { defaultOrder: "AS-1042" }));
    expect(html).toContain("Looking up…");
    expect(html).toContain("hc--loader hc--ink");
    expect((html.match(/class="hc hc--loader/g) ?? []).length).toBe(2);
    // The panel text stays the same, so the polite live region does not re-announce.
    expect(html).toContain("Your order&#x27;s journey appears here");
  });

  it("shows the plain button when idle", () => {
    const html = renderToStaticMarkup(createElement(TrackOrderForm, { defaultOrder: "" }));
    expect(html).toContain("Track order");
    expect(html).not.toContain("hc--loader");
  });
});
