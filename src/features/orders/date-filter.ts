import { dateToPktLocal, pktLocalToDate } from "@/lib/pk-time";
import type { OrderStatus } from "./status";

const DAY_MS = 24 * 60 * 60 * 1000;

export type OrderDateMode = "today" | "all" | "range";

export type OrderDateFilter = {
  mode: OrderDateMode;
  /** Pakistan calendar dates, suitable for date inputs. */
  from: string;
  to: string;
  /** Inclusive start and exclusive end instants, or null for all dates/errors. */
  start: Date | null;
  end: Date | null;
  error: string | null;
};

/**
 * Open orders (pending through shipped) default to all dates so older
 * work is never hidden; finished orders (delivered, cancelled) default to today.
 */
export function defaultOrderDateMode(status: OrderStatus): "today" | "all" {
  return status === "delivered" || status === "cancelled" ? "today" : "all";
}

/** A date range uses Pakistan calendar days, independent of the server's timezone. */
export function parseOrderDateFilter(
  params: { date?: string; from?: string; to?: string },
  now: Date = new Date(),
  defaultMode: "today" | "all" = "today",
): OrderDateFilter {
  const today = dateToPktLocal(now).slice(0, 10);
  const selected = params.date || defaultMode;
  if (selected === "all") return { mode: "all", from: today, to: today, start: null, end: null, error: null };
  if (selected === "today") {
    const start = pktLocalToDate(`${today}T00:00`)!;
    return { mode: "today", from: today, to: today, start, end: new Date(start.getTime() + DAY_MS), error: null };
  }
  if (selected !== "range") return { mode: "today", from: today, to: today, start: null, end: null, error: "Choose a valid date filter." };

  const from = (params.from ?? "").trim();
  const to = (params.to ?? "").trim();
  const start = /^\d{4}-\d{2}-\d{2}$/.test(from) ? pktLocalToDate(`${from}T00:00`) : null;
  const lastDay = /^\d{4}-\d{2}-\d{2}$/.test(to) ? pktLocalToDate(`${to}T00:00`) : null;
  if (!start || !lastDay) return { mode: "range", from, to, start: null, end: null, error: "Choose a valid start and end date." };
  if (start > lastDay) return { mode: "range", from, to, start: null, end: null, error: "The start date must be on or before the end date." };
  return { mode: "range", from, to, start, end: new Date(lastDay.getTime() + DAY_MS), error: null };
}
