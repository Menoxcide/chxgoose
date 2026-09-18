import { NextResponse } from "next/server";
import { isAmount, isVoteOutfit } from "@/lib/outfits";
import { recordHonk } from "@/lib/db";
import { verifyWebhook } from "@/lib/stripe";

export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get("stripe-signature");
  let event;
  try {
    event = verifyWebhook(raw, sig);
  } catch {
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }
  if (!event) {
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }
  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ ok: true });
  }
  const session = event.data.object;
  const sessionId = session.id;
  const outfitId = session.metadata?.outfitId ?? "";
  const amountCents = Number(session.metadata?.amountCents);
  const race = session.metadata?.raceDate ?? "";
  if (!isVoteOutfit(outfitId) || !isAmount(amountCents) || !race) {
    return NextResponse.json({ ok: true });
  }
  await recordHonk({ sessionId, raceDate: race, outfitId, amountCents });
  return NextResponse.json({ ok: true });
}
