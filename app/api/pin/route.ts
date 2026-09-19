import { NextResponse } from "next/server";
import { insertPin } from "@/lib/db";
import { geocodePlace } from "@/lib/geocode";
import { PIN_COOKIE, PIN_COOKIE_OPTS, hasPinCookie } from "@/lib/pin";
import {
  clientIp,
  ipHash,
  isAllowedOrigin,
  looksLikePlaceQuery,
  noStore,
  rateLimit,
  readJson,
} from "@/lib/security";

export async function POST(req: Request) {
  if (!isAllowedOrigin(req)) {
    return noStore(NextResponse.json({ error: "bad pin" }, { status: 403 }));
  }
  if (hasPinCookie(req.headers.get("cookie"))) {
    return noStore(
      NextResponse.json({ error: "You already dropped a pin.", alreadyPinned: true }, { status: 409 }),
    );
  }
  if (!rateLimit(`pin:${ipHash(clientIp(req))}`, 6, 60_000)) {
    return noStore(NextResponse.json({ error: "Slow down a second." }, { status: 429 }));
  }
  const body = await readJson<{ query?: unknown }>(req);
  if (!body) {
    return noStore(NextResponse.json({ error: "bad pin" }, { status: 400 }));
  }
  const query = typeof body.query === "string" ? body.query.trim() : "";
  if (!looksLikePlaceQuery(query)) {
    return noStore(NextResponse.json({ error: "Enter a city or postal code." }, { status: 400 }));
  }
  try {
    const hit = await geocodePlace(query);
    if (!hit) {
      return noStore(
        NextResponse.json(
          { error: "Couldn’t find that place. Try a city or postal code." },
          { status: 404 },
        ),
      );
    }
    await insertPin(hit.lat, hit.lng, hit.label);
    const res = NextResponse.json({
      ok: true,
      alreadyPinned: true,
      lat: hit.lat,
      lng: hit.lng,
      label: hit.label,
    });
    res.cookies.set(PIN_COOKIE, "1", PIN_COOKIE_OPTS);
    return noStore(res);
  } catch {
    return noStore(NextResponse.json({ error: "Couldn’t look that up. Try again." }, { status: 503 }));
  }
}
