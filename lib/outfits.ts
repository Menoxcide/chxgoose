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
  image: string;
};

export const OUTFIT_META: Record<OutfitId, OutfitMeta> = {
  football: {
    name: "Football",
    amazon: "https://www.amazon.com/dp/B0FVFL5Z6J",
    image: "/outfits/football/0.jpg",
  },
  farmer: {
    name: "Harvest farmer",
    amazon: "https://www.amazon.com/dp/B0H8GWBV17",
    image: "/outfits/farmer/0.jpg",
  },
  scarecrow: {
    name: "Fall scarecrow",
    amazon: "https://www.amazon.com/dp/B0H36DD2NF",
    image: "/outfits/scarecrow/0.jpg",
  },
  maple: {
    name: "Maple leaf",
    amazon: "https://www.amazon.com/dp/B0HBP15VG2",
    image: "/outfits/maple/0.jpg",
  },
  "maple-dress": {
    name: "Maple dress",
    amazon: "https://www.amazon.com/dp/B0H3YW591W",
    image: "/outfits/maple-dress/0.jpg",
  },
  leaves: {
    name: "Fall leaves",
    amazon: "https://www.amazon.com/dp/B0H83P8K38",
    image: "/outfits/leaves/0.jpg",
  },
  wizard: {
    name: "Halloween wizard",
    amazon: "https://www.amazon.com/dp/B0FFSQC6S5",
    image: "/outfits/wizard/0.jpg",
  },
  overalls: {
    name: "Blue overalls",
    amazon: "https://www.amazon.com/dp/B0GR4L5CRZ",
    image: "/outfits/overalls/0.jpg",
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
