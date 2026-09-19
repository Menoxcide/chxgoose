export type GeoHit = {
  lat: number;
  lng: number;
  label: string;
  zip: string | null;
  city: string | null;
  state: string | null;
};

export type PlaceBits = {
  zip: string | null;
  city: string | null;
  state: string | null;
  country?: string | null;
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

function usZip(raw: string): string | null {
  return raw.match(/\b(\d{5})(?:-\d{4})?\b/)?.[1] ?? null;
}

function stateFromName(raw: string): string | null {
  const t = raw.trim();
  if (/^[A-Za-z]{2}$/.test(t)) return t.toUpperCase();
  return STATE_ABBR[t.toLowerCase()] ?? null;
}

export function formatPlaceBits(b: PlaceBits): string {
  const city = b.city?.trim() || "";
  const state = b.state?.trim() || "";
  const zip = b.zip?.trim() || "";
  const country = b.country?.trim() || "";
  const skipCountry = !country || /^(united states|usa)$/i.test(country);
  const core = [city, state].filter(Boolean).join(", ");
  const withZip = zip && core && !core.startsWith(zip) ? `${zip}, ${core}` : core || zip;
  const withCountry =
    !skipCountry && withZip && !withZip.toLowerCase().includes(country.toLowerCase())
      ? `${withZip}, ${country}`
      : withZip;
  return (withCountry || city || "Somewhere").slice(0, 40);
}

export function detailsFromLabel(label: string): PlaceBits {
  const raw = label.trim();
  const zip = usZip(raw);
  const parts = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => !/^\d{5}(-\d{4})?$/.test(s));
  let state: string | null = null;
  if (parts.length) {
    const last = stateFromName(parts[parts.length - 1] ?? "");
    if (last) {
      state = last;
      parts.pop();
    }
  }
  return { zip, city: parts.join(", ") || null, state, country: null };
}

export function fillPlaceDetails(given: string, extra: PlaceBits): string {
  const have = detailsFromLabel(given);
  return formatPlaceBits({
    zip: have.zip || extra.zip,
    city: have.city || extra.city,
    state: have.state || extra.state,
    country: have.country || extra.country,
  });
}

export function bitsFromAddress(
  address: Record<string, string> | undefined,
  displayName: string,
  fallback: string,
): PlaceBits {
  const blob = `${displayName} ${fallback} ${address?.postcode ?? ""}`;
  const zip = usZip(blob);
  const iso = address?.["ISO3166-2-lvl4"] ?? "";
  const isoState = /^(US|CA)-[A-Z]{2}$/i.test(iso) ? iso.slice(-2).toUpperCase() : null;
  const state = isoState || (address?.state ? stateFromName(address.state) : null);
  const cityRaw =
    address?.city ||
    address?.town ||
    address?.village ||
    address?.hamlet ||
    address?.municipality ||
    address?.county ||
    "";
  const city = tidyPart(cityRaw) || null;
  const cc = (address?.country_code ?? "").toLowerCase();
  const country = !cc || cc === "us" ? null : address?.country || null;
  const fromName = detailsFromLabel(labelFromNominatim(displayName, fallback));
  return {
    zip: zip || fromName.zip,
    city: city || fromName.city,
    state: state || fromName.state,
    country: country || fromName.country,
  };
}

export function labelFromNominatim(displayName: string, fallback: string): string {
  const zip = usZip(`${displayName} ${fallback}`);
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
  const stateIdx = deduped.findIndex((p) => STATE_ABBR[p.toLowerCase()] || /^[A-Za-z]{2}$/.test(p));
  const place =
    deduped[0] || fallback.replace(/^\d{5}(?:-\d{4})?\s*,?\s*/, "").trim() || fallback.trim();
  const state = stateIdx > 0 ? stateFromName(deduped[stateIdx]) : null;
  return formatPlaceBits({ zip, city: place || null, state, country: null });
}

function hitFromNominatim(
  hit: { lat?: string; lon?: string; display_name?: string; address?: Record<string, string> },
  fallback: string,
): GeoHit | null {
  const lat = Number(hit.lat);
  const lng = Number(hit.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  const bits = bitsFromAddress(hit.address, hit.display_name ?? "", fallback);
  if (!bits.city && !bits.zip) {
    const fallbackBits = detailsFromLabel(labelFromNominatim(hit.display_name ?? "", fallback));
    bits.city = bits.city || fallbackBits.city;
    bits.state = bits.state || fallbackBits.state;
    bits.zip = bits.zip || fallbackBits.zip;
  }
  return { lat, lng, label: formatPlaceBits(bits), zip: bits.zip, city: bits.city, state: bits.state };
}

export function parseNominatim(data: unknown, fallback: string): GeoHit | null {
  if (!Array.isArray(data) || data.length === 0) return null;
  return hitFromNominatim(
    data[0] as { lat?: string; lon?: string; display_name?: string; address?: Record<string, string> },
    fallback,
  );
}

export function parseReverseNominatim(data: unknown, fallback: string): GeoHit | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  if ("error" in (data as { error?: unknown })) return null;
  return hitFromNominatim(
    data as { lat?: string; lon?: string; display_name?: string; address?: Record<string, string> },
    fallback,
  );
}

export function geocodeAttempts(q: string): URL[] {
  const urls: URL[] = [];
  const add = (params: Record<string, string>) => {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "1");
    url.searchParams.set("addressdetails", "1");
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
  } else {
    add({ city: q, countrycodes: "us" });
    add({ q, countrycodes: "us" });
  }
  add({ q });
  return urls;
}

async function nominatimGet(url: URL): Promise<unknown> {
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "chxgoose.com (Billie the porch goose)",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(4000),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function geocodePlace(query: string): Promise<GeoHit | null> {
  const q = query.trim().slice(0, 80);
  if (q.length < 2) return null;
  const attempts = geocodeAttempts(q).slice(0, 2);
  for (let i = 0; i < attempts.length; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, 1100));
    const url = attempts[i];
    if (!url) continue;
    const data = await nominatimGet(url);
    const hit = parseNominatim(data, q);
    if (hit) return hit;
  }
  return null;
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeoHit | null> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  const data = await nominatimGet(url);
  return parseReverseNominatim(data, `${lat},${lng}`);
}
