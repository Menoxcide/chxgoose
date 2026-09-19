import { NextResponse } from "next/server";
import { isAmount, isVoteOutfit } from "@/lib/outfits";
import { recordHonk } from "@/lib/db";
import { formatHonkSms, notifyOwner } from "@/lib/notify";
import { noStore } from "@/lib/security";
import { verifyWebhook } from "@/lib/stripe";

export async function POST(req: Request) {
  const raw = await req.text();
  if (raw.length > 64_000) {
    return noStore(NextResponse.json({ error: "bad signature" }, { status: 400 }));
  }
  const sig = req.headers.get("stripe-signature");
  let event;
  try {
    event = verifyWebhook(raw, sig);
  } catch {
    return noStore(NextResponse.json({ error: "bad signature" }, { status: 400 }));
  }
  if (!event) {
    return noStore(NextResponse.json({ error: "bad signature" }, { status: 400 }));
  }
  if (event.type !== "checkout.session.completed") {
    return noStore(NextResponse.json({ ok: true }));
  }
  const session = event.data.object;
  if (session.payment_status !== "paid") {
    return noStore(NextResponse.json({ ok: true }));
  }
  if (session.currency && session.currency !== "usd") {
    return noStore(NextResponse.json({ ok: true }));
  }
  const sessionId = session.id;
  const outfitId = session.metadata?.outfitId ?? "";
  const amountCents = session.amount_total;
  const race = session.metadata?.raceDate ?? "";
  if (!isVoteOutfit(outfitId) || amountCents == null || !isAmount(amountCents) || !race) {
    return noStore(NextResponse.json({ ok: true }));
  }
  const { inserted } = await recordHonk({ sessionId, raceDate: race, outfitId, amountCents });
  if (inserted) notifyOwner(formatHonkSms(outfitId, amountCents));
  return noStore(NextResponse.json({ ok: true }));
}
