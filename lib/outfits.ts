export const VOTE_OUTFIT_IDS = [
  "farmer",
  "scarecrow",
  "maple",
  "maple-dress",
  "leaves",
  "wizard",
  "overalls",
] as const;

export type VoteOutfitId = (typeof VOTE_OUTFIT_IDS)[number];
export const DEFAULT_OUTFIT = "football" as const;
export type OutfitId = VoteOutfitId | typeof DEFAULT_OUTFIT;

export const AMOUNTS = [300, 700, 2100] as const;
export type AmountCents = (typeof AMOUNTS)[number];

export type OutfitMeta = {
  name: string;
  amazon: string;
};

export const OUTFIT_META: Record<OutfitId, OutfitMeta> = {
  football: {
    name: "Football",
    amazon: "https://www.amazon.com/dp/B0FVFL5Z6J",
  },
  farmer: {
    name: "Harvest farmer",
    amazon: "https://www.amazon.com/dp/B0H8GWBV17",
  },
  scarecrow: {
    name: "Fall scarecrow",
    amazon: "https://www.amazon.com/dp/B0H36DD2NF",
  },
  maple: {
    name: "Maple leaf",
    amazon: "https://www.amazon.com/dp/B0HBP15VG2",
  },
  "maple-dress": {
    name: "Maple dress",
    amazon: "https://www.amazon.com/dp/B0H3YW591W",
  },
  leaves: {
    name: "Fall leaves",
    amazon: "https://www.amazon.com/dp/B0H83P8K38",
  },
  wizard: {
    name: "Halloween wizard",
    amazon: "https://www.amazon.com/dp/B0FFSQC6S5",
  },
  overalls: {
    name: "Blue overalls",
    amazon: "https://www.amazon.com/dp/B0GR4L5CRZ",
  },
};

export const AMOUNT_META: Record<AmountCents, { label: string; dollars: string }> = {
  300: { label: "$3", dollars: "$3" },
  700: { label: "$7", dollars: "$7" },
  2100: { label: "$21", dollars: "$21" },
};

export function isVoteOutfit(id: string): id is VoteOutfitId {
  return (VOTE_OUTFIT_IDS as readonly string[]).includes(id);
}

export function isAmount(n: number): n is AmountCents {
  return (AMOUNTS as readonly number[]).includes(n);
}

export function isOutfit(id: string): id is OutfitId {
  return id === DEFAULT_OUTFIT || isVoteOutfit(id);
}
