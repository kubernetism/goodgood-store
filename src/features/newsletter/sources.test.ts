import { describe, expect, it } from "vitest";
import { newsletterSource, newsletterSourceLabel } from "./sources";

describe("newsletter sources", () => {
  it("accepts the home page form and labels it for the admin", () => {
    expect(newsletterSource("home")).toBe("home");
    expect(newsletterSourceLabel("home")).toBe("Home page");
  });

  it("records anything unexpected as the footer", () => {
    expect(newsletterSource("elsewhere")).toBe("footer");
    expect(newsletterSource(undefined)).toBe("footer");
  });
});
