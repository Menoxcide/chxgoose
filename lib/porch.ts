import type { OutfitId, VoteOutfitId } from "./outfits";

export const ORDER_STATUSES = ["ordered", "shipping", "on_her"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type PorchOrder = {
  outfitId: VoteOutfitId;
  status: OrderStatus;
};

export type OwnerUpdate = {
  caption?: string | null;
  wearing?: OutfitId;
  order?: PorchOrder | null;
};

export type OwnerParse = { ok: true; update: OwnerUpdate } | { ok: false; error: string };

export function isOrderStatus(id: string): id is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(id);
}

export function orderLine(name: string, status: OrderStatus): string {
  if (status === "ordered") return `${name} is ordered.`;
  if (status === "shipping") return `${name} is on the way.`;
  return `${name} is on her.`;
}

export function wearingLine(caption: string | null | undefined, outfitName: string): string {
  const text = caption?.trim();
  return text ? text : outfitName;
}

export function visitorsLine(n: number): string {
  const count = Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  return count === 1 ? "1 visitor" : `${count} visitors`;
}

export function shareText(joke: string): string {
  const line = joke.trim();
  return line
    ? `${line}\n\nBillie, porch goose at 905 Bridge.`
    : "You found Billie! Porch goose at 905 Bridge.";
}
