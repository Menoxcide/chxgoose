import { after } from "next/server";
import { AMOUNT_META, OUTFIT_META, isAmount, isVoteOutfit } from "./outfits";
import { sendSms } from "./sms";

export function formatPinSms(label: string): string {
  return `Billie pin: ${label.trim() || "somewhere"}`;
}

export function formatNoteSms(name: string, note: string, place: string | null): string {
  const who = [name.trim() || "A visitor", place?.trim()].filter(Boolean).join(" · ");
  return `Billie note — ${who}\n${note.trim().slice(0, 160)}`;
}

export function formatHonkSms(outfitId: string, amountCents: number): string {
  const look = isVoteOutfit(outfitId) ? OUTFIT_META[outfitId].name : outfitId;
  const dollars = isAmount(amountCents) ? AMOUNT_META[amountCents].dollars : `$${Math.round(amountCents / 100)}`;
  return `Billie honk: ${dollars} ${look}`;
}

export function notifyOwner(message: string) {
  after(() =>
    sendSms(message).catch((err) => {
      console.error("notify", err instanceof Error ? err.message : "fail");
    }),
  );
}
