import { raceDate } from "./detroit";
import { dailyJoke, jokeOfTheDay } from "./jokes";
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
  readLifetimePots,
  readPins,
  readWearing,
  seedPotsIfMissing,
} from "./db";

export function staticState(
  now: Date = new Date(),
  alreadyPinned = false,
): PublicState {
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
    alreadyPinned,
  };
}

export async function loadState(
  now: Date = new Date(),
  alreadyPinned = false,
): Promise<PublicState> {
  if (!getSql()) return staticState(now, alreadyPinned);
  try {
    await ensureSchema();
    await performRollover(now);
    const today = raceDate(now);
    await seedPotsIfMissing(today);
    const [pots, wearing, honkCount, pins, flock, dressed, joke] = await Promise.all([
      readLifetimePots(),
      readWearing(),
      readHonkCount(),
      readPins(),
      flockCount(),
      dressedFor(),
      dailyJoke(now),
    ]);
    return {
      wearing,
      winning: leader(pots),
      pots: pots.map((p) => ({ outfitId: p.outfitId, amountCents: p.amountCents })),
      pins,
      honkCount,
      flockCount: flock,
      joke,
      raceDate: today,
      dressedToday: dressed === today,
      degraded: false,
      alreadyPinned,
    };
  } catch {
    return staticState(now, alreadyPinned);
  }
}
