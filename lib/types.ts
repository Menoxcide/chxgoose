import type { OutfitId, VoteOutfitId } from "./outfits";
import type { PorchOrder } from "./porch";

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
  wearingCaption: string | null;
  order: PorchOrder | null;
  winning: VoteOutfitId | null;
  pots: PublicPot[];
  pins: PublicPin[];
  honkCount: number;
  visitors: number;
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
