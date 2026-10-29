/*
 * Pakistan Standard Time is UTC+5 all year (no daylight saving), so admin
 * date/time inputs are read and written as fixed +05:00 wall-clock times,
 * whatever time zone the admin's device or the server is in.
 */

const PKT_OFFSET_MS = 5 * 60 * 60 * 1000;
const LOCAL_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

/** "2026-12-31T23:59" (PKT wall clock, from <input type="datetime-local">) -> Date, or null if malformed. */
export function pktLocalToDate(value: string): Date | null {
  const match = LOCAL_PATTERN.exec(value.trim());
  if (!match) return null;
  const [, y, mo, d, h, mi] = match.map(Number) as [number, number, number, number, number, number];
  const utc = Date.UTC(y, mo - 1, d, h, mi) - PKT_OFFSET_MS;
  const date = new Date(utc);
  // Reject impossible dates like 2026-02-31 that Date.UTC silently rolls over.
  const check = new Date(utc + PKT_OFFSET_MS);
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== mo - 1 || check.getUTCDate() !== d) return null;
  if (h > 23 || mi > 59) return null;
  return date;
}

/** Date -> "YYYY-MM-DDTHH:mm" in PKT, for datetime-local inputs. */
export function dateToPktLocal(date: Date): string {
  return new Date(date.getTime() + PKT_OFFSET_MS).toISOString().slice(0, 16);
}

const pktDateTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Karachi",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

/** e.g. "27 Oct 2026, 2:05 pm" in Pakistan time. */
export function formatPktDateTime(date: Date | string): string {
  return pktDateTime.format(typeof date === "string" ? new Date(date) : date);
}

const pktDay = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi", year: "numeric", month: "2-digit", day: "2-digit" });

/** Start of the current PKT calendar day, as a UTC Date (for "today's revenue"). */
export function startOfPktDay(now: Date): Date {
  return new Date(`${pktDay.format(now)}T00:00:00+05:00`);
}
