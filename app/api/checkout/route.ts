import { NextResponse } from "next/server";
import { raceDate } from "@/lib/detroit";
import { isAmount, isVoteOutfit } from "@/lib/outfits";
import { createHonkSession } from "@/lib/stripe";
import { ensureSchema, performRollover } from "@/lib/db";

export async function POST(req: Request) {
  let body: { outfitId?: string; amountCents?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Billy didn’t get that honk, try again." }, { status: 400 });
  }
  const outfitId = body.outfitId;
  const amountCents = body.amountCents;
  if (!outfitId || !isVoteOutfit(outfitId) || typeof amountCents !== "number" || !isAmount(amountCents)) {
    return NextResponse.json({ error: "Billy didn’t get that honk, try again." }, { status: 400 });
  }
  try {
    await ensureSchema();
    await performRollover();
  } catch {
    // still try checkout; webhook will fail closed if db is down
  }
  const origin = new URL(req.url).origin;
  try {
    const url = await createHonkSession({
      outfitId,
      amountCents,
      raceDate: raceDate(),
      origin,
    });
    if (!url) {
      return NextResponse.json(
        { error: "Billy didn’t get that honk, try again." },
        { status: 503 },
      );
    }
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ error: "Billy didn’t get that honk, try again." }, { status: 500 });
  }
}
