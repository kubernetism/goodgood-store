import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const status = vi.hoisted(() => ({ pending: false }));
vi.mock("react-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-dom")>()),
  useFormStatus: () => ({ pending: status.pending, data: null, method: null, action: null }),
}));
import { SubmitButton } from "./submit-button";

describe("admin SubmitButton", () => {
  beforeEach(() => { status.pending = false; });

  it("shows the ink comb and pending label while saving, keeping the button readable", () => {
    status.pending = true;
    // children is a required prop; the createElement rest argument would not satisfy its type in a .ts test.
    // eslint-disable-next-line react/no-children-prop
    const html = renderToStaticMarkup(createElement(SubmitButton, { pendingLabel: "Saving…", children: "Save product" }));
    expect(html).toContain("Saving…");
    expect(html).toContain("hc--loader hc--ink");
    expect(html).toContain('aria-disabled="true"');
    expect(html).not.toContain("admin-spinner");
  });

  it("shows only its label when idle", () => {
    // eslint-disable-next-line react/no-children-prop -- see above
    const html = renderToStaticMarkup(createElement(SubmitButton, { children: "Save product" }));
    expect(html).toContain("Save product");
    expect(html).not.toContain("hc--loader");
  });
});
