import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { JsonLd } from "./json-ld";

describe("JSON-LD", () => {
  it("escapes admin-provided text so it cannot close the script tag", () => {
    const html = renderToStaticMarkup(createElement(JsonLd, { data: { name: "</script><script>alert(1)</script>" } }));
    expect(html).toContain("\\u003c/script>");
    expect(html).not.toContain("</script><script>");
  });
});
