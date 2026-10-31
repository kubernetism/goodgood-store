/*
 * CSV export (pure, unit tested). Every cell is quoted. Cells that a
 * spreadsheet would run as a formula (starting with = + - @, tab or carriage
 * return) are prefixed with an apostrophe, the OWASP CSV-injection defence,
 * because subscriber emails are typed by strangers.
 */

const FORMULA_START = /^[=+\-@\t\r]/;

export function csvCell(value: string | number | null | undefined): string {
  let text = value === null || value === undefined ? "" : String(value);
  if (FORMULA_START.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

/** Rows joined with CRLF (RFC 4180), with a UTF-8 BOM so Excel reads accents correctly. */
export function toCsv(header: ReadonlyArray<string>, rows: ReadonlyArray<ReadonlyArray<string | number | null | undefined>>): string {
  return `﻿${[header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")}\r\n`;
}
