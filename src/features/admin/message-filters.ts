import { firstParam, pageNumber, type RawSearchParams } from "./search-params";

/*
 * Inbox filters parsed from the query string (pure, so it is unit tested).
 * Unknown values fall back to "all" rather than erroring.
 */

/** The privacy policy deletes contact messages after 24 months unless they relate to an open issue. */
export const MESSAGE_RETENTION_MONTHS = 24;

export type MessageStatusFilter = "" | "read" | "unread";
export type MessageAgeFilter = "" | "retention";
export type MessageFilters = { q: string; status: MessageStatusFilter; age: MessageAgeFilter; page: number };

export function parseMessageFilters(params: RawSearchParams): MessageFilters {
  const status = firstParam(params.status);
  return {
    q: (firstParam(params.q) ?? "").trim().slice(0, 100),
    status: status === "read" || status === "unread" ? status : "",
    age: firstParam(params.age) === "retention" ? "retention" : "",
    page: pageNumber(firstParam(params.page)),
  };
}

/** Query string that keeps the filters (not the page) for pagination links. */
export function messageFilterQuery({ q, status, age }: MessageFilters): URLSearchParams {
  const query = new URLSearchParams();
  if (q) query.set("q", q);
  if (status) query.set("status", status);
  if (age) query.set("age", age);
  return query;
}

/** Messages received before this instant are past the retention period. */
export function retentionCutoff(now: Date): Date {
  const cutoff = new Date(now);
  cutoff.setUTCMonth(cutoff.getUTCMonth() - MESSAGE_RETENTION_MONTHS);
  return cutoff;
}
