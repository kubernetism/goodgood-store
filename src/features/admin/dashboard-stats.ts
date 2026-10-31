import { dateToPktLocal } from "@/lib/pk-time";
import { startOfPktDay } from "@/lib/pk-time";

/*
 * Dashboard analytics helpers (pure, unit tested). The numbers themselves are
 * aggregated in SQL (order-data.ts); this module owns the date ranges, the
 * ratios and the query strings that link each figure to the orders list.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

export const dashboardRanges = [
  { key: "today", label: "Today", days: 1 },
  { key: "7d", label: "7 days", days: 7 },
  { key: "30d", label: "30 days", days: 30 },
  { key: "all", label: "All time", days: null },
] as const;
export type DashboardRangeKey = (typeof dashboardRanges)[number]["key"];
export const DEFAULT_DASHBOARD_RANGE: DashboardRangeKey = "all";

export type DashboardRange = {
  key: DashboardRangeKey;
  label: string;
  /** Inclusive start (start of a PKT day), or null for all time. */
  start: Date | null;
  /** Date parameters for /admin/orders that show exactly this range. */
  orderDateQuery: URLSearchParams;
  /** Lower-case phrase for hints: "today", "in the last 7 days", "of all time". */
  phrase: string;
  /** Scope label after "Showing:", e.g. "last 7 days · 25–31 Oct (PKT)". */
  caption: string;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

/** "2026-10-25" -> { day: 25, month: "Oct" }. */
function dayMonth(isoDate: string): { day: number; month: string } {
  return { day: Number(isoDate.slice(8, 10)), month: MONTHS[Number(isoDate.slice(5, 7)) - 1] ?? "" };
}

/** Inclusive PKT date span: "25–31 Oct", "28 Sep–4 Oct", or "31 Oct" for one day. */
export function formatDaySpan(fromIso: string, toIso: string): string {
  const from = dayMonth(fromIso);
  const to = dayMonth(toIso);
  if (fromIso === toIso) return `${to.day} ${to.month}`;
  if (from.month === to.month && fromIso.slice(0, 4) === toIso.slice(0, 4)) return `${from.day}–${to.day} ${to.month}`;
  return `${from.day} ${from.month}–${to.day} ${to.month}`;
}

const longPktDay = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Karachi" });

/** The dashboard's date line, in Pakistan time: "Saturday 31 October". */
export function formatPktLongDay(now: Date): string {
  return longPktDay.format(now).replace(",", "");
}

/** Ranges are whole Pakistan calendar days, ending today. */
export function parseDashboardRange(value: string | undefined, now: Date): DashboardRange {
  const range = dashboardRanges.find((entry) => entry.key === value) ?? dashboardRanges.find((entry) => entry.key === DEFAULT_DASHBOARD_RANGE)!;
  const today = dateToPktLocal(now).slice(0, 10);
  if (range.days === null) return { key: range.key, label: range.label, start: null, orderDateQuery: new URLSearchParams({ date: "all" }), phrase: "of all time", caption: "all time" };
  const start = new Date(startOfPktDay(now).getTime() - (range.days - 1) * DAY_MS);
  if (range.days === 1) return { key: range.key, label: range.label, start, orderDateQuery: new URLSearchParams({ date: "today" }), phrase: "today", caption: `today · ${formatDaySpan(today, today)} (PKT)` };
  const from = dateToPktLocal(start).slice(0, 10);
  return {
    key: range.key,
    label: range.label,
    start,
    orderDateQuery: new URLSearchParams({ date: "range", from, to: today }),
    phrase: `in the last ${range.days} days`,
    caption: `last ${range.days} days · ${formatDaySpan(from, today)} (PKT)`,
  };
}

/**
 * Of the orders that reached an outcome, the share delivered and the share
 * cancelled: delivered / (delivered + cancelled) and its complement. Open
 * orders are not counted either way. Null when nothing has finished yet.
 */
export function outcomeRatios(delivered: number, cancelled: number): { success: number | null; fail: number | null } {
  const finished = delivered + cancelled;
  if (finished <= 0) return { success: null, fail: null };
  return { success: delivered / finished, fail: cancelled / finished };
}

/** 0.6667 -> "66.7%", 1 -> "100%", null -> "–". */
export function formatRatio(ratio: number | null): string {
  if (ratio === null) return "–";
  const percent = Math.round(ratio * 1000) / 10;
  return `${Number.isInteger(percent) ? percent.toFixed(0) : percent.toFixed(1)}%`;
}

export const productSorts = ["units", "revenue"] as const;
export type ProductSort = (typeof productSorts)[number];

export function parseProductSort(value: string | undefined): ProductSort {
  return value === "revenue" ? "revenue" : "units";
}

/** A stage's share of all orders in the range, as a whole percent ("0%" when there are none). */
export function formatShare(count: number, total: number): string {
  if (total <= 0 || count <= 0) return "0%";
  return `${Math.round((count / total) * 100)}%`;
}

/** Width of an inline bar as a percentage of the largest value (min 2% so a non-zero value stays visible). */
export function barPercent(value: number, max: number): number {
  if (max <= 0 || value <= 0) return 0;
  return Math.max(2, Math.round((value / max) * 100));
}

/** Dashboard URL that keeps the other dashboard parameters. */
export function dashboardHref(current: { range: DashboardRangeKey; sort: ProductSort; page: number }, change: Partial<{ range: DashboardRangeKey; sort: ProductSort; page: number }>): string {
  const next = { ...current, ...change };
  const query = new URLSearchParams();
  if (next.range !== DEFAULT_DASHBOARD_RANGE) query.set("range", next.range);
  if (next.sort !== "units") query.set("psort", next.sort);
  if (next.page > 1) query.set("ppage", String(next.page));
  return query.size ? `/admin?${query}` : "/admin";
}
