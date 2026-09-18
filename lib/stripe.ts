import Stripe from "stripe";
import { AMOUNT_META, OUTFIT_META, type AmountCents, type VoteOutfitId } from "./outfits";

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2026-08-26.dahlia" });
}

function integrationId() {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  let suffix = "";
  for (let i = 0; i < 8; i++) suffix += letters[Math.floor(Math.random() * letters.length)];
  return `chxgoose_${suffix}`;
}

export async function createHonkSession(input: {
  outfitId: VoteOutfitId;
  amountCents: AmountCents;
  raceDate: string;
  origin: string;
}) {
  const stripe = getStripe();
  if (!stripe) return null;
  const name = OUTFIT_META[input.outfitId].name;
  const chip = AMOUNT_META[input.amountCents];
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${input.origin}/?honk=1`,
    cancel_url: `${input.origin}/`,
    metadata: {
      outfitId: input.outfitId,
      amountCents: String(input.amountCents),
      raceDate: input.raceDate,
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: input.amountCents,
          product_data: {
            name: `Honk: ${chip.dollars} toward Billy's ${name}`,
            description: chip.label,
          },
        },
      },
    ],
    integration_identifier: integrationId(),
  });
  return session.url;
}

export function verifyWebhook(rawBody: string, signature: string | null) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret || !signature) return null;
  return stripe.webhooks.constructEvent(rawBody, signature, secret);
}
