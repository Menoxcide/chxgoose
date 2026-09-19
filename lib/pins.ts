import type { PublicPin } from "./types";

export type PinCluster = {
  lat: number;
  lng: number;
  label: string;
  count: number;
};

function groupKey(p: PublicPin): string {
  const name = p.label?.trim().toLowerCase().replace(/\s+/g, " ");
  if (name) return `n:${name}`;
  return `g:${p.lat.toFixed(3)},${p.lng.toFixed(3)}`;
}

export function clusterPins(pins: PublicPin[]): PinCluster[] {
  const groups = new Map<string, PublicPin[]>();
  for (const p of pins) {
    const key = groupKey(p);
    const arr = groups.get(key);
    if (arr) arr.push(p);
    else groups.set(key, [p]);
  }
  return [...groups.values()].map((group) => {
    const lat = group.reduce((s, p) => s + p.lat, 0) / group.length;
    const lng = group.reduce((s, p) => s + p.lng, 0) / group.length;
    const label = group.find((p) => p.label?.trim())?.label?.trim() || "Here";
    return { lat, lng, label, count: group.length };
  });
}

export function clusterCaption(c: PinCluster): string {
  return c.count > 1 ? `${c.label} (${c.count})` : c.label;
}
