import { raceDate } from "./detroit";
import { dailyJoke, jokeKindFor, jokeOfTheDay } from "./jokes";
import { DEFAULT_OUTFIT } from "./outfits";
import { leader } from "./race";
import type { PublicState } from "./types";
import {
  dressedFor,
  ensureSchema,
  flockCount,
  getSql,
  performRollover,
  readGuestbook,
  readHonkCount,
  readLifetimePots,
  readOrder,
  readPins,
  readVisitorCount,
  readWearing,
  readWearingCaption,
  seedPotsIfMissing,
} from "./db";

export function staticState(
  now: Date = new Date(),
  alreadyPinned = false,
  alreadySigned = false,
): PublicState {
  const today = raceDate(now);
  return {
    wearing: DEFAULT_OUTFIT,
    wearingCaption: null,
    order: null,
    winning: null,
    pots: [],
    pins: [],
    honkCount: 0,
    visitors: 0,
    flockCount: 0,
    joke: jokeOfTheDay(now),
    jokeKind: jokeKindFor(now),
    raceDate: today,
    dressedToday: false,
    degraded: true,
    alreadyPinned,
    alreadySigned,
    guestbook: [],
  };
}

export async function loadState(
  now: Date = new Date(),
  alreadyPinned = false,
  alreadySigned = false,
): Promise<PublicState> {
  if (!getSql()) return staticState(now, alreadyPinned, alreadySigned);
  try {
    await ensureSchema();
    await performRollover(now);
    const today = raceDate(now);
    await seedPotsIfMissing(today);
    const [pots, wearing, wearingCaption, order, honkCount, visitors, pins, flock, dressed, daily, guestbook] =
      await Promise.all([
        readLifetimePots(),
        readWearing(),
        readWearingCaption(),
        readOrder(),
        readHonkCount(),
        readVisitorCount(),
        readPins(),
        flockCount(),
        dressedFor(),
        dailyJoke(now),
        readGuestbook(),
      ]);
    return {
      wearing,
      wearingCaption,
      order,
      winning: leader(pots),
      pots: pots.map((p) => ({ outfitId: p.outfitId, amountCents: p.amountCents })),
      pins,
      honkCount,
      visitors,
      flockCount: flock,
      joke: daily.text,
      jokeKind: daily.kind,
      raceDate: today,
      dressedToday: dressed === today,
      degraded: false,
      alreadyPinned,
      alreadySigned,
      guestbook,
    };
  } catch {
    return staticState(now, alreadyPinned, alreadySigned);
  }
}
