import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { seedCatalog } from "@/test/seed-catalog";
import { ProductSlider } from "./product-slider";

const products = seedCatalog().products;
const render = (count: number) => renderToStaticMarkup(createElement(ProductSlider, { products: products.slice(0, count), label: "Honey" }));

describe("landing product layouts", () => {
  it("renders no empty product row", () => expect(render(0)).toBe(""));
  it("renders one centered, bounded card without carousel controls", () => {
    const html = render(1);
    expect(html).toContain("max-w-[25rem]");
    expect(html).toContain(products[0].name);
    expect(html).not.toContain("sliding-row__control");
  });
  it("shows two bounded cards together", () => {
    const html = render(2);
    expect(html).toContain("max-w-[51.5rem]");
    expect(html).toContain(products[0].name);
    expect(html).toContain(products[1].name);
    expect(html).not.toContain("sliding-row__control");
  });
  it("keeps a bounded carousel for three or four products and full width for larger collections", () => {
    expect(render(3)).toContain("sliding-row");
    expect(render(4)).not.toContain("sliding-row--full-width");
    expect(render(5)).toContain("sliding-row--full-width");
  });
});
