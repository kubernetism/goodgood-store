import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getVisibleTestimonials: vi.fn() }));
vi.mock("@/features/testimonials/testimonial-data", () => ({ getVisibleTestimonials: mocks.getVisibleTestimonials }));
import { Testimonials } from "./testimonials";

describe("testimonials section", () => {
  it("hides the section when no testimonials are visible", async () => {
    mocks.getVisibleTestimonials.mockResolvedValue([]);
    expect(await Testimonials({})).toBeNull();
  });
  it("renders a single testimonial without looping controls", async () => {
    mocks.getVisibleTestimonials.mockResolvedValue([{ id: "one", name: "A Customer", role: "Lahore", rating: 5, quote: "Lovely honey" }]);
    const html = renderToStaticMarkup((await Testimonials({}))!);
    expect(html).toContain("Lovely honey");
    expect(html).not.toContain("sliding-row__control");
  });
  it("renders the sliding carousel for a collection", async () => {
    mocks.getVisibleTestimonials.mockResolvedValue(Array.from({ length: 5 }, (_, i) => ({ id: String(i), name: `Customer ${i}`, role: "", rating: 5, quote: "Lovely honey" })));
    const html = renderToStaticMarkup((await Testimonials({}))!);
    expect(html).toContain("sliding-row--full-width");
    expect(html).toContain("Pause customer testimonials");
  });
});
