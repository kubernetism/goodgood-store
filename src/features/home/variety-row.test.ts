import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { seedCatalog } from "@/test/seed-catalog";
import { VarietyRow } from "./variety-row";

describe("landing varieties", () => {
  const catalog = seedCatalog();

  it("only shows categories with visible products", () => {
    const product = catalog.products[0];
    const html = renderToStaticMarkup(createElement(VarietyRow, { catalog: { ...catalog, products: [product] } }));
    expect(html).toContain(product.categoryName);
    expect(html).not.toContain("0 products");
    expect(html.match(/<li/g)).toHaveLength(1);
  });

  it("hides the section when there are no products", () => {
    expect(renderToStaticMarkup(createElement(VarietyRow, { catalog: { ...catalog, products: [] } }))).toBe("");
  });
});
