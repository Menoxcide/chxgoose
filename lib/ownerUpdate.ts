import { isOutfit, isVoteOutfit } from "./outfits";
import { isOrderStatus, type OwnerParse, type OwnerUpdate } from "./porch";
import { cleanText } from "./security";

export function parseOwnerBody(body: unknown): OwnerParse {
  if (!body || typeof body !== "object") return { ok: false, error: "Couldn’t read that." };
  const raw = body as Record<string, unknown>;
  const update: OwnerUpdate = {};
  let touched = false;

  if ("caption" in raw) {
    touched = true;
    update.caption = cleanText(raw.caption, 120) || null;
  }

  if ("wearing" in raw && raw.wearing != null && raw.wearing !== "") {
    touched = true;
    const wearing = cleanText(raw.wearing, 40);
    if (!isOutfit(wearing)) return { ok: false, error: "That look isn’t on the porch." };
    update.wearing = wearing;
  }

  if ("orderStatus" in raw) {
    touched = true;
    const status = cleanText(raw.orderStatus, 20);
    if (!status || status === "clear") {
      update.order = null;
    } else if (!isOrderStatus(status)) {
      return { ok: false, error: "Pick ordered, on the way, or on her." };
    } else {
      const outfitId = cleanText(raw.orderOutfitId, 40);
      if (!isVoteOutfit(outfitId)) return { ok: false, error: "Pick a look for that order." };
      update.order = { outfitId, status };
      if (status === "on_her") update.wearing = outfitId;
    }
  }

  if (!touched) return { ok: false, error: "Nothing to save." };
  return { ok: true, update };
}
