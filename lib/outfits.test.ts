import { describe, expect, it } from "vitest";
import {
  AMOUNTS,
  DEFAULT_OUTFIT,
  VOTE_OUTFIT_IDS,
  isAmount,
  isVoteOutfit,
} from "./outfits";

describe("allowlists", () => {
  it("has Amazon vote outfits and excludes the football default", () => {
    expect(VOTE_OUTFIT_IDS).toHaveLength(7);
    expect(isVoteOutfit(DEFAULT_OUTFIT)).toBe(false);
    expect(isVoteOutfit("hawaiian")).toBe(true);
  });

  it("only allows the three honk amounts", () => {
    expect(AMOUNTS).toEqual([300, 700, 2100]);
    expect(isAmount(300)).toBe(true);
    expect(isAmount(100)).toBe(false);
  });
});
