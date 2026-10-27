/*
 * Money is stored as integer paisa (1 rupee = 100 paisa), the ISO 4217 minor
 * unit for PKR that payment gateways expect. Catalogue prices are whole rupees,
 * so the storefront never shows paisa.
 *
 * The "Rs" prefix and en-US digit grouping are assembled by hand instead of
 * using Intl's PKR currency style: server (Node) and browser ICU builds can
 * disagree on currency spacing, which would cause hydration mismatches.
 */
const rupeeDigits = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** Whole rupees, e.g. 2450 -> "Rs 2,450" (non-breaking space, so it never wraps). */
export function formatRupees(rupees: number): string {
  return `Rs ${rupeeDigits.format(rupees)}`;
}

/** Integer paisa -> display string, e.g. 245_000 -> "Rs 2,450". */
export function formatPrice(paisa: number): string {
  return formatRupees(Math.round(paisa / 100));
}

// Dates are stored as ISO calendar dates and rendered in UTC so server and
// client output always match (no hydration drift across time zones).
// Day-month-year order, as is usual in Pakistan.
const longDate = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

export function formatDate(isoDate: string): string {
  return longDate.format(new Date(`${isoDate}T00:00:00Z`));
}
