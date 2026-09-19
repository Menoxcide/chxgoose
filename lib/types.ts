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

export type GuestNote = {
  name: string;
  note: string;
  place: string | null;
};

export type PublicState = {
  wearing: OutfitId;
  winning: VoteOutfitId | null;
  pots: PublicPot[];
  pins: PublicPin[];
  honkCount: number;
  flockCount: number;
  joke: string;
  jokeKind: "dad" | "mom";
  raceDate: string;
  dressedToday: boolean;
  degraded: boolean;
  alreadyPinned: boolean;
  alreadySigned: boolean;
  guestbook: GuestNote[];
};
