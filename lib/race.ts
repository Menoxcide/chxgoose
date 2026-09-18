import {
  DEFAULT_OUTFIT,
  VOTE_OUTFIT_IDS,
  type OutfitId,
  type VoteOutfitId,
} from "./outfits";

export type Pot = {
  outfitId: VoteOutfitId;
  amountCents: number;
  leadingSince: string | null;
};

export function emptyPots(): Pot[] {
  return VOTE_OUTFIT_IDS.map((outfitId) => ({
    outfitId,
    amountCents: 0,
    leadingSince: null,
  }));
}

export function leader(pots: Pot[]): VoteOutfitId | null {
  const funded = pots.filter((p) => p.amountCents > 0);
  if (funded.length === 0) return null;
  funded.sort((a, b) => {
    if (b.amountCents !== a.amountCents) return b.amountCents - a.amountCents;
    return (a.leadingSince ?? "\uffff").localeCompare(b.leadingSince ?? "\uffff");
  });
  return funded[0].outfitId;
}

export function applyHonk(
  pots: Pot[],
  outfitId: VoteOutfitId,
  amountCents: number,
  at: Date,
): Pot[] {
  const next = pots.map((p) => ({ ...p }));
  const pot = next.find((p) => p.outfitId === outfitId);
  if (!pot) {
    throw new Error(`unknown outfit ${outfitId}`);
  }
  const previous = pot.amountCents;
  pot.amountCents += amountCents;
  const maxOther = Math.max(
    0,
    ...next.filter((p) => p.outfitId !== outfitId).map((p) => p.amountCents),
  );
  if (pot.amountCents > maxOther && previous <= maxOther) {
    pot.leadingSince = at.toISOString();
  }
  return next;
}

export function rollover(
  wearing: OutfitId,
  pots: Pot[],
): { wearing: OutfitId; pots: Pot[] } {
  const win = leader(pots);
  return {
    wearing: win ?? wearing,
    pots: emptyPots(),
  };
}

export { DEFAULT_OUTFIT };
