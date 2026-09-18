import { describe, expect, it } from "vitest";
import { dayOfYear, raceDate } from "./detroit";

describe("raceDate", () => {
  it("stays on the Detroit calendar date before midnight EDT", () => {
    expect(raceDate(new Date("2026-09-19T03:30:00Z"))).toBe("2026-09-18");
  });

  it("rolls at midnight America/Detroit", () => {
    expect(raceDate(new Date("2026-09-19T04:00:00Z"))).toBe("2026-09-19");
  });
});

describe("dayOfYear", () => {
  it("is 1 on January 1 in Detroit", () => {
    expect(dayOfYear(new Date("2026-01-01T12:00:00Z"))).toBe(1);
  });

  it("is 365 on December 31 of a non-leap year", () => {
    expect(dayOfYear(new Date("2026-12-31T18:00:00Z"))).toBe(365);
  });
});
