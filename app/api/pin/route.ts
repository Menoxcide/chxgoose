import { NextResponse } from "next/server";
import { insertPin } from "@/lib/db";
import { geocodePlace } from "@/lib/geocode";
import { PIN_COOKIE, PIN_COOKIE_OPTS, hasPinCookie } from "@/lib/pin";

function cleanLabel(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const stripped = raw.replace(/<[^>]*>/g, "").trim().slice(0, 40);
  return stripped.length ? stripped : null;
}

export async function POST(req: Request) {
  if (hasPinCookie(req.headers.get("cookie"))) {
    return NextResponse.json(
      { error: "You already dropped a pin.", alreadyPinned: true },
      { status: 409 },
    );
  }
  let body: { query?: unknown; lat?: unknown; lng?: unknown; label?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad pin" }, { status: 400 });
  }

  let lat = Number(body.lat);
  let lng = Number(body.lng);
  let label = cleanLabel(body.label);
  const query = typeof body.query === "string" ? body.query.trim() : "";

  if (query.length >= 2) {
    try {
      const hit = await geocodePlace(query);
      if (!hit) {
        return NextResponse.json(
          { error: "Couldn’t find that place. Try a city or postal code." },
          { status: 404 },
        );
      }
      lat = hit.lat;
      lng = hit.lng;
      label = hit.label;
    } catch {
      return NextResponse.json({ error: "Couldn’t look that up. Try again." }, { status: 503 });
    }
  }

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ error: "Enter a city or postal code." }, { status: 400 });
  }
  try {
    await insertPin(lat, lng, label);
    const res = NextResponse.json({ ok: true, alreadyPinned: true, lat, lng, label });
    res.cookies.set(PIN_COOKIE, "1", PIN_COOKIE_OPTS);
    return res;
  } catch {
    return NextResponse.json({ error: "honk later" }, { status: 503 });
  }
}
