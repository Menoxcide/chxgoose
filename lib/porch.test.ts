import { describe, expect, it } from "vitest";
import { parseOwnerBody } from "./ownerUpdate";
import { orderLine, shareText, visitorsLine, wearingLine } from "./porch";

describe("porch copy", () => {
  it("uses a custom caption when one is set", () => {
    expect(wearingLine("Halloween costume designed by Billie", "Football")).toBe(
      "Halloween costume designed by Billie",
    );
    expect(wearingLine("  ", "Football")).toBe("Football");
    expect(wearingLine(null, "Football")).toBe("Football");
  });

  it("names each order stage", () => {
    expect(orderLine("Maple leaf", "ordered")).toBe("Maple leaf is ordered.");
    expect(orderLine("Maple leaf", "shipping")).toBe("Maple leaf is on the way.");
    expect(orderLine("Maple leaf", "on_her")).toBe("Maple leaf is on her.");
  });

  it("pluralizes visitors", () => {
    expect(visitorsLine(0)).toBe("0 visitors");
    expect(visitorsLine(1)).toBe("1 visitor");
    expect(visitorsLine(14)).toBe("14 visitors");
  });

  it("shares the joke with the porch", () => {
    expect(shareText("Why did the goose cross the road?")).toBe(
      "Why did the goose cross the road?\n\nBillie, porch goose at 905 Bridge.",
    );
    expect(shareText("  ")).toBe("You found Billie! Porch goose at 905 Bridge.");
  });
});

describe("owner desk", () => {
  it("saves a caption and clears an order", () => {
    const parsed = parseOwnerBody({
      caption: "Halloween costume designed by Billie",
      wearing: "football",
      orderStatus: "",
    });
    expect(parsed).toEqual({
      ok: true,
      update: {
        caption: "Halloween costume designed by Billie",
        wearing: "football",
        order: null,
      },
    });
  });

  it("marks the ordered look as what she is wearing", () => {
    const parsed = parseOwnerBody({
      orderOutfitId: "wizard",
      orderStatus: "on_her",
      wearing: "football",
    });
    expect(parsed).toEqual({
      ok: true,
      update: {
        wearing: "wizard",
        order: { outfitId: "wizard", status: "on_her" },
      },
    });
  });

  it("rejects an order with no look", () => {
    expect(parseOwnerBody({ orderStatus: "ordered" })).toEqual({
      ok: false,
      error: "Pick a look for that order.",
    });
  });
});
