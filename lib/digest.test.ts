import { describe, expect, it } from "vitest";
import { formatDigestSms, type DayStats } from "./digest";

const sample: DayStats = {
  date: "2026-09-18",
  people: 8,
  visits: 14,
  honks: 2,
  honkCents: 900,
  pins: 1,
  notes: 0,
  winning: "Maple leaf",
};

describe("formatDigestSms", () => {
  it("fits a porch day onto one text", () => {
    const text = formatDigestSms(sample);
    expect(text).toBe(
      "Billie 2026-09-18\n14 visits / 8 people\n2 honks ($9)\n1 pin · 0 notes\nwinning: Maple leaf",
    );
    expect(text.length).toBeLessThanOrEqual(160);
  });

  it("omits a winner when nobody has honked", () => {
    expect(
      formatDigestSms({
        ...sample,
        honks: 0,
        honkCents: 0,
        winning: null,
      }),
    ).toBe("Billie 2026-09-18\n14 visits / 8 people\n0 honks ($0)\n1 pin · 0 notes");
  });
});
