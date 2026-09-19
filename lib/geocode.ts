export type GeoHit = {
  lat: number;
  lng: number;
  label: string;
};

const STATE_ABBR: Record<string, string> = {
  alabama: "AL",
  alaska: "AK",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  delaware: "DE",
  florida: "FL",
  georgia: "GA",
  hawaii: "HI",
  idaho: "ID",
  illinois: "IL",
  indiana: "IN",
  iowa: "IA",
  kansas: "KS",
  kentucky: "KY",
  louisiana: "LA",
  maine: "ME",
  maryland: "MD",
  massachusetts: "MA",
  michigan: "MI",
  minnesota: "MN",
  mississippi: "MS",
  missouri: "MO",
  montana: "MT",
  nebraska: "NE",
  nevada: "NV",
  "new hampshire": "NH",
  "new jersey": "NJ",
  "new mexico": "NM",
  "new york": "NY",
  "north carolina": "NC",
  "north dakota": "ND",
  ohio: "OH",
  oklahoma: "OK",
  oregon: "OR",
  pennsylvania: "PA",
  "rhode island": "RI",
  "south carolina": "SC",
  "south dakota": "SD",
  tennessee: "TN",
  texas: "TX",
  utah: "UT",
  vermont: "VT",
  virginia: "VA",
  washington: "WA",
  "west virginia": "WV",
  wisconsin: "WI",
  wyoming: "WY",
};

function tidyPart(part: string): string {
  return part.replace(/\s+(charter township|township|county)$/i, "").trim();
}

export function labelFromNominatim(displayName: string, fallback: string): string {
  const parts = displayName
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => !/^(united states|usa)$/i.test(s) && !/^\d{5}(-\d{4})?$/.test(s))
    .map(tidyPart)
    .filter(Boolean);
  const deduped: string[] = [];
  for (const part of parts) {
    if (deduped.at(-1)?.toLowerCase() !== part.toLowerCase()) deduped.push(part);
  }
  const stateIdx = deduped.findIndex((p) => STATE_ABBR[p.toLowerCase()]);
  const place = deduped[0] || fallback.trim();
  const state = stateIdx > 0 ? STATE_ABBR[deduped[stateIdx].toLowerCase()] : null;
  const short = state && place ? `${place}, ${state}` : deduped.slice(0, 2).join(", ") || place;
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
