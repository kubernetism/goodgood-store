import type { OrderDateFilter } from "@/features/orders/date-filter";
import { defaultOrderDateMode } from "@/features/orders/date-filter";
import type { OrderStatus } from "@/features/orders/status";

/*
 * Query strings for the orders list (pure, unit tested). The date filter is
 * kept in the URL only when it differs from the status's default (O1), so a
 * tab without an explicit date always shows that status's default range.
 */

export function orderListQuery(status: OrderStatus, q: string, filter: OrderDateFilter): URLSearchParams {
  const query = new URLSearchParams({ status });
  if (q) query.set("q", q);
  if (filter.mode !== defaultOrderDateMode(status)) query.set("date", filter.mode);
  if (filter.mode === "range") {
    query.set("from", filter.from);
    query.set("to", filter.to);
  }
  return query;
}

/**
 * Status tab link. A date the owner chose explicitly carries over to every
 * tab; otherwise each tab opens on its own default (all dates for open orders).
 */
export function orderTabQuery(tab: OrderStatus, q: string, filter: OrderDateFilter, explicitDate: boolean): URLSearchParams {
  if (explicitDate) return orderListQuery(tab, q, filter);
  const query = new URLSearchParams({ status: tab });
  if (q) query.set("q", q);
  return query;
}

const shortDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const formatDay = (isoDate: string) => shortDate.format(new Date(`${isoDate}T00:00:00Z`));

/** Human label for the active date filter ("Today", "All dates", "1 Oct – 15 Oct"). */
export function dateFilterLabel(filter: Pick<OrderDateFilter, "mode" | "from" | "to">): string {
  if (filter.mode === "today") return "Today";
  if (filter.mode === "all") return "All dates";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(filter.from) || !/^\d{4}-\d{2}-\d{2}$/.test(filter.to)) return "Chosen dates";
  return filter.from === filter.to ? formatDay(filter.from) : `${formatDay(filter.from)} – ${formatDay(filter.to)}`;
}
