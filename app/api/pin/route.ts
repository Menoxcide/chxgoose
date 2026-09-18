import { NextResponse } from "next/server";
import { insertPin } from "@/lib/db";
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
  let body: { lat?: unknown; lng?: unknown; label?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad pin" }, { status: 400 });
  }
  const lat = Number(body.lat);
  const lng = Number(body.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ error: "bad pin" }, { status: 400 });
  }
  try {
    await insertPin(lat, lng, cleanLabel(body.label));
    const res = NextResponse.json({ ok: true, alreadyPinned: true });
    res.cookies.set(PIN_COOKIE, "1", PIN_COOKIE_OPTS);
    return res;
  } catch {
    return NextResponse.json({ error: "honk later" }, { status: 503 });
  }
}
