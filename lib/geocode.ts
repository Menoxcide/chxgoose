export type GeoHit = {
  lat: number;
  lng: number;
  label: string;
};

export function labelFromNominatim(displayName: string, fallback: string): string {
  const parts = displayName
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const short = parts.slice(0, 2).join(", ") || fallback.trim();
  return short.slice(0, 40) || "Somewhere";
}

export function parseNominatim(data: unknown, fallback: string): GeoHit | null {
  if (!Array.isArray(data) || data.length === 0) return null;
  const hit = data[0] as { lat?: string; lon?: string; display_name?: string };
  const lat = Number(hit.lat);
  const lng = Number(hit.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return {
    lat,
    lng,
    label: labelFromNominatim(hit.display_name ?? "", fallback),
  };
}

export function geocodeAttempts(q: string): URL[] {
  const urls: URL[] = [];
  const add = (params: Record<string, string>) => {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "1");
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    urls.push(url);
  };
  if (/^\d{5}(-\d{4})?$/.test(q)) {
    add({ postalcode: q.slice(0, 5), countrycodes: "us" });
    add({ q: `${q.slice(0, 5)} USA` });
  } else if (/^[A-Za-z]\d[A-Za-z]\s*\d[A-Za-z]\d$/.test(q)) {
    add({ postalcode: q.toUpperCase().replace(/\s+/g, " "), countrycodes: "ca" });
    add({ q: `${q} Canada` });
  } else if (/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(q)) {
    add({ postalcode: q.toUpperCase(), countrycodes: "gb" });
    add({ q: `${q} UK` });
  }
  add({ q });
  return urls;
}

export async function geocodePlace(query: string): Promise<GeoHit | null> {
  const q = query.trim().slice(0, 80);
  if (q.length < 2) return null;
  const attempts = geocodeAttempts(q).slice(0, 2);
  for (const url of attempts) {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "chxgoose.com (Billie the porch goose)",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) continue;
    const hit = parseNominatim(await res.json(), q);
    if (hit) return hit;
  }
  return null;
}
