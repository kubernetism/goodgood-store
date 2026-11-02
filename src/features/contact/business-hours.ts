/*
 * Office hours in Pakistan time (UTC+5 all year, no daylight saving) and a
 * pure "open now?" status for the contact page. Pure so it is unit tested
 * with fixed instants and can run in the browser after hydration, whatever
 * time zone the visitor's device is in.
 */

const PKT_OFFSET_MS = 5 * 60 * 60 * 1000;

/** 0 = Sunday … 6 = Saturday, as in Date#getUTCDay. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type OpeningHours = {
  days: ReadonlyArray<Weekday>;
  /** Minutes after midnight PKT, e.g. 9:00am = 540. */
  opens: number;
  closes: number;
};

export type BusinessStatus = {
  /** Current wall-clock time in Peshawar, minutes after midnight. */
  now: number;
} & (
  | { state: "open" | "closing"; closes: number }
  | { state: "closed"; opens: number; when: "today" | "tomorrow" | "later"; day: Weekday }
  /** No opening days configured. */
  | { state: "closed"; opens: null }
);

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const SHORT_DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/** Within this many minutes of closing the status reads "closing". */
const CLOSING_MINUTES = 30;

/** 540 -> "9:00am", 1020 -> "5:00pm", 750 -> "12:30pm". */
export function formatClock(minutes: number): string {
  const hours24 = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(mins).padStart(2, "0")}${hours24 < 12 ? "am" : "pm"}`;
}

/** Day and minute of the week in Pakistan for an instant. */
export function pktWeekTime(instant: Date): { day: Weekday; minutes: number } {
  const shifted = new Date(instant.getTime() + PKT_OFFSET_MS);
  return { day: shifted.getUTCDay() as Weekday, minutes: shifted.getUTCHours() * 60 + shifted.getUTCMinutes() };
}

/**
 * Open, closing or closed right now in Pakistan, with the next change.
 * Assumes the hours do not cross midnight (true for an office desk).
 */
export function getBusinessStatus(hours: OpeningHours, instant: Date): BusinessStatus {
  const { day, minutes: now } = pktWeekTime(instant);
  const openToday = hours.days.includes(day);

  if (openToday && now >= hours.opens && now < hours.closes) {
    return { now, state: hours.closes - now <= CLOSING_MINUTES ? "closing" : "open", closes: hours.closes };
  }
  if (openToday && now < hours.opens) {
    return { now, state: "closed", opens: hours.opens, when: "today", day };
  }
  for (let offset = 1; offset <= 7; offset += 1) {
    const next = ((day + offset) % 7) as Weekday;
    if (hours.days.includes(next)) {
      return { now, state: "closed", opens: hours.opens, when: offset === 1 ? "tomorrow" : "later", day: next };
    }
  }
  return { now, state: "closed", opens: null };
}

/** "Open now · until 5:00pm PKT" / "Closed · opens Mon 9:00am PKT" for the compact pill. */
export function describeStatusShort(status: BusinessStatus): string {
  if (status.state !== "closed") return `${status.state === "closing" ? "Closing soon" : "Open now"} · until ${formatClock(status.closes)} PKT`;
  if (status.opens === null) return "Closed";
  const day = status.when === "later" ? SHORT_DAY_NAMES[status.day] : status.when;
  return `Closed · opens ${day} ${formatClock(status.opens)} PKT`;
}

/** Supporting line on the hanging sign. */
export function describeStatusLong(status: BusinessStatus): string {
  if (status.state !== "closed") {
    const closes = formatClock(status.closes);
    return status.state === "open" ? `Lines open until ${closes} PKT` : `Closing at ${closes} PKT. Call now.`;
  }
  if (status.opens === null) return "Leave us a message and we'll reply.";
  const day = status.when === "later" ? DAY_NAMES[status.day] : status.when;
  return `Opens ${day} at ${formatClock(status.opens)} PKT`;
}

/**
 * "Monday–Friday, 9:00am–5:00pm PKT". Only contiguous day ranges are
 * supported, which is all the shop needs; a test pins it to site.ts.
 */
export function formatOpeningHours(hours: OpeningHours, short = false): string {
  const names = short ? SHORT_DAY_NAMES : DAY_NAMES;
  const first = hours.days[0];
  const last = hours.days.at(-1);
  if (first === undefined || last === undefined) return "Closed";
  const days = first === last ? names[first] : `${names[first]}–${names[last]}`;
  return `${days}, ${formatClock(hours.opens)}–${formatClock(hours.closes)} PKT`;
}

/** "HH:MM" for schema.org openingHoursSpecification. */
export function toSchemaTime(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

/** schema.org day names for the open days. */
export function schemaDays(hours: OpeningHours): string[] {
  return hours.days.map((day) => DAY_NAMES[day]);
}
