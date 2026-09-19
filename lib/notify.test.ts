import { describe, expect, it } from "vitest";
import { formatHonkSms, formatNoteSms, formatPinSms } from "./notify";

describe("formatPinSms", () => {
  it("names the town", () => {
    expect(formatPinSms("Charlevoix, MI")).toBe("Billie pin: Charlevoix, MI");
  });
});

describe("formatNoteSms", () => {
  it("includes the note and place", () => {
    expect(formatNoteSms("Ada", "Saw Billie. Honked.", "Petoskey")).toBe(
      "Billie note — Ada · Petoskey\nSaw Billie. Honked.",
    );
  });

  it("drops the place when missing", () => {
    expect(formatNoteSms("Ada", "Honk.", null)).toBe("Billie note — Ada\nHonk.");
  });
});

describe("formatHonkSms", () => {
  it("names the look and amount", () => {
    expect(formatHonkSms("maple", 300)).toBe("Billie honk: $3 Maple leaf");
  });
});
