import { describe, expect, it } from "vitest";
import { siteConfig } from "@/lib/site";
import {
  describeStatusLong,
  describeStatusShort,
  formatClock,
  formatOpeningHours,
  getBusinessStatus,
  pktWeekTime,
  schemaDays,
  toSchemaTime,
  type OpeningHours,
} from "./business-hours";

const hours: OpeningHours = siteConfig.contact.openingHours;

/** The UTC instant for a Pakistan wall-clock time (UTC+5). 2 Nov 2026 is a Monday. */
const pkt = (isoLocal: string) => new Date(`${isoLocal}+05:00`);
const status = (isoLocal: string) => getBusinessStatus(hours, pkt(isoLocal));

describe("office hours in Pakistan time", () => {
  it("matches the human-readable hours shown across the site", () => {
    expect(formatOpeningHours(hours)).toBe(siteConfig.contact.hours);
    expect(formatOpeningHours(hours, true)).toBe("Mon–Fri, 9:00am–5:00pm PKT");
  });

  it("formats clock times in 12-hour form", () => {
    expect([0, 540, 720, 750, 1020, 1439].map(formatClock)).toEqual(["12:00am", "9:00am", "12:00pm", "12:30pm", "5:00pm", "11:59pm"]);
  });

  it("reads the weekday in Pakistan, whatever the device or server zone", () => {
    // 21:00 UTC on Thursday 5 Nov 2026 is already 02:00 on Friday in Pakistan.
    expect(pktWeekTime(new Date("2026-11-05T21:00:00Z"))).toEqual({ day: 5, minutes: 120 });
    // Same instant written with a US offset.
    expect(pktWeekTime(new Date("2026-11-05T16:00:00-05:00"))).toEqual({ day: 5, minutes: 120 });
  });

  it("opens at exactly 9:00am on a weekday", () => {
    expect(status("2026-11-02T08:59")).toEqual({ now: 539, state: "closed", opens: 540, when: "today", day: 1 });
    expect(status("2026-11-02T09:00")).toEqual({ now: 540, state: "open", closes: 1020 });
  });

  it("is 'closing' for the last half hour and closed at 5:00pm", () => {
    expect(status("2026-11-04T16:29").state).toBe("open");
    expect(status("2026-11-04T16:30").state).toBe("closing");
    expect(status("2026-11-04T16:59").state).toBe("closing");
    expect(status("2026-11-04T17:00")).toMatchObject({ state: "closed", when: "tomorrow", day: 4 });
  });

  it("reopens tomorrow on weeknights", () => {
    expect(status("2026-11-05T18:00")).toMatchObject({ state: "closed", when: "tomorrow", day: 5 });
  });

  it("reopens on Monday after Friday evening and on Saturday", () => {
    for (const time of ["2026-11-06T17:01", "2026-11-07T11:00"]) {
      expect(status(time)).toMatchObject({ state: "closed", when: "later", day: 1 });
    }
  });

  it("says 'tomorrow' late on Sunday", () => {
    expect(status("2026-11-08T23:59")).toMatchObject({ state: "closed", when: "tomorrow", day: 1 });
  });

  it("describes each state for the pill and the sign", () => {
    expect(describeStatusShort(status("2026-11-02T10:00"))).toBe("Open now · until 5:00pm PKT");
    expect(describeStatusShort(status("2026-11-02T16:45"))).toBe("Closing soon · until 5:00pm PKT");
    expect(describeStatusShort(status("2026-11-07T10:00"))).toBe("Closed · opens Mon 9:00am PKT");
    expect(describeStatusShort(status("2026-11-02T07:00"))).toBe("Closed · opens today 9:00am PKT");

    expect(describeStatusLong(status("2026-11-02T10:00"))).toBe("Lines open until 5:00pm PKT");
    expect(describeStatusLong(status("2026-11-02T16:45"))).toBe("Closing at 5:00pm PKT. Call now.");
    expect(describeStatusLong(status("2026-11-03T20:00"))).toBe("Opens tomorrow at 9:00am PKT");
    expect(describeStatusLong(status("2026-11-07T10:00"))).toBe("Opens Monday at 9:00am PKT");
  });

  it("stays closed without a reopening time when no days are configured", () => {
    const none: OpeningHours = { days: [], opens: 540, closes: 1020 };
    const closed = getBusinessStatus(none, pkt("2026-11-02T10:00"));
    expect(closed).toEqual({ now: 600, state: "closed", opens: null });
    expect(describeStatusShort(closed)).toBe("Closed");
  });

  it("produces schema.org opening hours values", () => {
    expect(schemaDays(hours)).toEqual(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
    expect([toSchemaTime(hours.opens), toSchemaTime(hours.closes)]).toEqual(["09:00", "17:00"]);
  });
});
