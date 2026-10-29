import { describe, expect, it } from "vitest";
import { dateToPktLocal, pktLocalToDate, startOfPktDay } from "./pk-time";

describe("PKT conversions", () => {
  it("reads datetime-local values as UTC+5", () => {
    expect(pktLocalToDate("2026-12-31T23:59")?.toISOString()).toBe("2026-12-31T18:59:00.000Z");
  });

  it("round-trips", () => {
    expect(dateToPktLocal(new Date("2026-12-31T18:59:00Z"))).toBe("2026-12-31T23:59");
  });

  it("rejects malformed and impossible dates", () => {
    expect(pktLocalToDate("2026-02-31T10:00")).toBeNull();
    expect(pktLocalToDate("2026-12-31")).toBeNull();
    expect(pktLocalToDate("2026-12-31T25:00")).toBeNull();
  });

  it("finds the start of the Pakistan day", () => {
    // 20:30 UTC on 1 Nov is already 01:30 on 2 Nov in Pakistan.
    expect(startOfPktDay(new Date("2026-11-01T20:30:00Z")).toISOString()).toBe("2026-11-01T19:00:00.000Z");
  });
});
