import type { PublicPin } from "./types";

export type PinCluster = {
  lat: number;
  lng: number;
  label: string;
  count: number;
};

function cityToken(label: string | null): string {
  const parts = (label ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts[0] && /^\d{5}(-\d{4})?$/.test(parts[0])) parts.shift();
  const city = (parts[0] ?? "").replace(/\s+(charter township|township|county)$/i, "").trim();
  return city;
}

function groupKey(p: PublicPin): string {
  const city = cityToken(p.label);
  if (city) return `c:${city}:${p.lat.toFixed(0)},${p.lng.toFixed(0)}`;
  return `g:${p.lat.toFixed(3)},${p.lng.toFixed(3)}`;
}

function prettyLabel(s: string): string {
  return s.replace(/,\s*([A-Za-z]{2})$/, (_, st: string) => `, ${st.toUpperCase()}`);
}

function pickLabel(group: PublicPin[]): string {
  const names = group.map((p) => p.label?.trim()).filter((s): s is string => Boolean(s));
  if (names.length === 0) return "Here";
  names.sort((a, b) => {
    const state = (s: string) => (/,\s*[A-Za-z]{2}$/.test(s) ? 1 : 0);
    if (state(b) !== state(a)) return state(b) - state(a);
    const commas = (s: string) => (s.match(/,/g) ?? []).length;
    if (commas(b) !== commas(a)) return commas(b) - commas(a);
    if (b.length !== a.length) return b.length - a.length;
    return a.localeCompare(b);
  });
  return prettyLabel(names[0]);
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
    return { lat, lng, label: pickLabel(group), count: group.length };
  });
}

export function clusterCaption(c: PinCluster): string {
  return c.count > 1 ? `${c.label} (${c.count})` : c.label;
}
