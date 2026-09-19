import { describe, expect, it } from "vitest";
import { censorText, isMostlyCensored } from "./censor";

describe("censorText", () => {
  it("keeps a kind guestbook note", () => {
    expect(censorText("Saw Billie from Charlevoix. Cute goose!")).toBe(
      "Saw Billie from Charlevoix. Cute goose!",
    );
  });

  it("stars a slur and keeps the rest", () => {
    const out = censorText("what a retard goose");
    expect(out.toLowerCase()).not.toContain("retard");
    expect(out).toContain("goose");
    expect(out).toContain("•");
  });

  it("catches leetspeak", () => {
    expect(censorText("f4ggot")).toContain("•");
    expect(censorText("f4ggot").toLowerCase()).not.toContain("fag");
  });

  it("does not trip on class or assume", () => {
    expect(censorText("first class porch")).toBe("first class porch");
    expect(censorText("I assume she honks")).toBe("I assume she honks");
  });
});

describe("isMostlyCensored", () => {
  it("flags a note that is only slurs", () => {
    expect(isMostlyCensored(censorText("retard"))).toBe(true);
    expect(isMostlyCensored(censorText("Loved the football outfit"))).toBe(false);
  });
});
