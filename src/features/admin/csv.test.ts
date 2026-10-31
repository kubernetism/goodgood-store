import { describe, expect, it } from "vitest";
import { csvCell, toCsv } from "./csv";

describe("csvCell", () => {
  it("quotes every cell and doubles embedded quotes", () => {
    expect(csvCell("a@b.com")).toBe('"a@b.com"');
    expect(csvCell('say "hi", ok')).toBe('"say ""hi"", ok"');
    expect(csvCell(null)).toBe('""');
    expect(csvCell(42)).toBe('"42"');
  });
  it("neutralises spreadsheet formulas", () => {
    for (const evil of ["=HYPERLINK(\"http://x\")", "+1+1", "-2+3", "@SUM(A1)", "\tcmd", "\rcmd"]) {
      expect(csvCell(evil).startsWith(`"'`)).toBe(true);
    }
    expect(csvCell("name+tag@example.com")).toBe('"name+tag@example.com"');
  });
});

describe("toCsv", () => {
  it("writes a BOM, a header and CRLF rows", () => {
    expect(toCsv(["Email", "Joined"], [["a@b.com", "2026-10-31 10:00"]])).toBe('﻿"Email","Joined"\r\n"a@b.com","2026-10-31 10:00"\r\n');
  });
});
