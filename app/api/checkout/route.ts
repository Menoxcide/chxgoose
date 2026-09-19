import { NextResponse } from "next/server";
import { HONK_FAIL } from "@/lib/copy";
import { raceDate } from "@/lib/detroit";
import { isAmount, isVoteOutfit } from "@/lib/outfits";
import {
  clientIp,
  ipHash,
  isAllowedOrigin,
  noStore,
  rateLimit,
  readJson,
  siteOrigin,
} from "@/lib/security";
import { createHonkSession } from "@/lib/stripe";
import { ensureSchema, performRollover } from "@/lib/db";

export async function POST(req: Request) {
  if (!isAllowedOrigin(req)) {
    return noStore(NextResponse.json({ error: HONK_FAIL }, { status: 403 }));
  }
  if (!rateLimit(`checkout:${ipHash(clientIp(req))}`, 8, 60_000)) {
    return noStore(NextResponse.json({ error: HONK_FAIL }, { status: 429 }));
  }
  const body = await readJson<{ outfitId?: string; amountCents?: number }>(req);
  if (!body) {
    return noStore(NextResponse.json({ error: HONK_FAIL }, { status: 400 }));
  }
  const outfitId = body.outfitId;
  const amountCents = body.amountCents;
  if (!outfitId || !isVoteOutfit(outfitId) || typeof amountCents !== "number" || !isAmount(amountCents)) {
    return noStore(NextResponse.json({ error: HONK_FAIL }, { status: 400 }));
  }
  try {
    await ensureSchema();
    await performRollover();
  } catch {
    // webhook fails closed if db is down
  }
  try {
    const url = await createHonkSession({
      outfitId,
      amountCents,
      raceDate: raceDate(),
      origin: siteOrigin(),
    });
    if (!url) {
      return noStore(NextResponse.json({ error: HONK_FAIL }, { status: 503 }));
    }
    return noStore(NextResponse.json({ url }));
  } catch {
    return noStore(NextResponse.json({ error: HONK_FAIL }, { status: 500 }));
  }
}
