export const VOTE_OUTFIT_IDS = [
  "rain-hat",
  "tigers",
  "santa",
  "swimsuit",
  "flannel",
  "life-jacket",
  "snowsuit",
  "tuxedo",
] as const;

export type VoteOutfitId = (typeof VOTE_OUTFIT_IDS)[number];
export const DEFAULT_OUTFIT = "bowtie" as const;
export type OutfitId = VoteOutfitId | typeof DEFAULT_OUTFIT;

export const AMOUNTS = [300, 700, 2100] as const;
export type AmountCents = (typeof AMOUNTS)[number];

export const OUTFIT_META: Record<
  OutfitId,
  { name: string; src: string }
> = {
  bowtie: { name: "Bow tie", src: "/billy/bowtie.jpg" },
  "rain-hat": { name: "Rain hat", src: "/billy/rain-hat.jpg" },
  tigers: { name: "Tigers cap", src: "/billy/tigers.jpg" },
  santa: { name: "Santa", src: "/billy/santa.jpg" },
  swimsuit: { name: "Swimsuit", src: "/billy/swimsuit.jpg" },
  flannel: { name: "Flannel", src: "/billy/flannel.jpg" },
  "life-jacket": { name: "Life jacket", src: "/billy/life-jacket.jpg" },
  snowsuit: { name: "Snowsuit", src: "/billy/snowsuit.jpg" },
  tuxedo: { name: "Tuxedo", src: "/billy/tuxedo.jpg" },
};

export const AMOUNT_META: Record<AmountCents, { label: string; dollars: string }> = {
  300: { label: "nibble of corn", dollars: "$3" },
  700: { label: "a good honk", dollars: "$7" },
  2100: { label: "full raincoat", dollars: "$21" },
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
