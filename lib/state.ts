import { raceDate } from "./detroit";
import { jokeOfTheDay } from "./jokes";
import { DEFAULT_OUTFIT } from "./outfits";
import { leader } from "./race";
import type { PublicState } from "./types";
import {
  dressedFor,
  ensureSchema,
  flockCount,
  getSql,
  performRollover,
  readHonkCount,
  readPins,
  readPots,
  readWearing,
  seedPotsIfMissing,
} from "./db";

export function staticState(now: Date = new Date()): PublicState {
  const today = raceDate(now);
  return {
    wearing: DEFAULT_OUTFIT,
    winning: null,
    pots: [],
    pins: [],
    honkCount: 0,
    flockCount: 0,
    joke: jokeOfTheDay(now),
    raceDate: today,
    dressedToday: false,
    degraded: true,
  };
}

export async function loadState(now: Date = new Date()): Promise<PublicState> {
  if (!getSql()) return staticState(now);
  try {
    await ensureSchema();
    await performRollover(now);
    const today = raceDate(now);
    await seedPotsIfMissing(today);
    const [pots, wearing, honkCount, pins, flock, dressed] = await Promise.all([
      readPots(today),
      readWearing(),
      readHonkCount(),
      readPins(),
      flockCount(),
      dressedFor(),
    ]);
    return {
      wearing,
      winning: leader(pots),
      pots: pots.map((p) => ({ outfitId: p.outfitId, amountCents: p.amountCents })),
      pins,
      honkCount,
      flockCount: flock,
      joke: jokeOfTheDay(now),
      raceDate: today,
      dressedToday: dressed === today,
      degraded: false,
    };
  } catch {
    return staticState(now);
  }
}
