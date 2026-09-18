import { NextResponse } from "next/server";
import { insertPin } from "@/lib/db";

function cleanLabel(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const stripped = raw.replace(/<[^>]*>/g, "").trim().slice(0, 40);
  return stripped.length ? stripped : null;
}

export async function POST(req: Request) {
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
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "honk later" }, { status: 503 });
  }
}
