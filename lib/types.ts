import type { OutfitId, VoteOutfitId } from "./outfits";

export type PublicPot = {
  outfitId: VoteOutfitId;
  amountCents: number;
};

export type PublicPin = {
  lat: number;
  lng: number;
  label: string | null;
};

export type PublicState = {
  wearing: OutfitId;
  winning: VoteOutfitId | null;
  pots: PublicPot[];
  pins: PublicPin[];
  honkCount: number;
  flockCount: number;
  joke: string;
  raceDate: string;
  dressedToday: boolean;
  degraded: boolean;
};
