import { describe, expect, it } from "vitest";
import { containsPattern } from "./search";

describe("containsPattern", () => {
  it("wraps plain text in wildcards", () => {
    expect(containsPattern("sidr honey")).toBe("%sidr honey%");
  });
  it("escapes LIKE wildcards and the escape character so they match literally", () => {
    expect(containsPattern("100%")).toBe("%100\\%%");
    expect(containsPattern("a_b")).toBe("%a\\_b%");
    expect(containsPattern("C:\\path")).toBe("%C:\\\\path%");
    expect(containsPattern("%_\\")).toBe("%\\%\\_\\\\%");
  });
});
