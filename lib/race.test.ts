import { describe, expect, it } from "vitest";
import { applyHonk, emptyPots, leader, rollover } from "./race";
import { DEFAULT_OUTFIT } from "./outfits";

const t1 = new Date("2026-09-18T12:00:00Z");
const t2 = new Date("2026-09-18T13:00:00Z");

describe("applyHonk / leader", () => {
  it("increments the chosen pot", () => {
    const pots = applyHonk(emptyPots(), "rain-hat", 300, t1);
    expect(pots.find((p) => p.outfitId === "rain-hat")?.amountCents).toBe(300);
    expect(leader(pots)).toBe("rain-hat");
  });

  it("sets leadingSince only when taking a strict lead", () => {
    let pots = applyHonk(emptyPots(), "rain-hat", 700, t1);
    const firstLead = pots.find((p) => p.outfitId === "rain-hat")?.leadingSince;
    pots = applyHonk(pots, "rain-hat", 300, t2);
    expect(pots.find((p) => p.outfitId === "rain-hat")?.leadingSince).toBe(
      firstLead,
    );
  });

  it("breaks ties by who got there first", () => {
    let pots = applyHonk(emptyPots(), "santa", 700, t1);
    pots = applyHonk(pots, "tuxedo", 700, t2);
    expect(leader(pots)).toBe("santa");
    expect(pots.find((p) => p.outfitId === "tuxedo")?.leadingSince).toBeNull();
  });

  it("gives the lead to a later outfit that goes strictly ahead", () => {
    let pots = applyHonk(emptyPots(), "santa", 700, t1);
    pots = applyHonk(pots, "tuxedo", 2100, t2);
    expect(leader(pots)).toBe("tuxedo");
  });

  it("returns null when nobody has honked", () => {
    expect(leader(emptyPots())).toBeNull();
  });
});

describe("rollover", () => {
  it("keeps wearing the current look when the race is empty", () => {
    const next = rollover(DEFAULT_OUTFIT, emptyPots());
    expect(next.wearing).toBe(DEFAULT_OUTFIT);
    expect(next.pots.every((p) => p.amountCents === 0)).toBe(true);
  });

  it("puts the winner on Billy and resets pots", () => {
    const pots = applyHonk(emptyPots(), "flannel", 2100, t1);
    const next = rollover(DEFAULT_OUTFIT, pots);
    expect(next.wearing).toBe("flannel");
    expect(leader(next.pots)).toBeNull();
  });
});
