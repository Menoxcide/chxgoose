import { NextResponse } from "next/server";
import { raceDate } from "@/lib/detroit";
import { markDressed } from "@/lib/db";
import { noStore, safeEqual } from "@/lib/security";

export async function POST(req: Request) {
  const key = process.env.OWNER_KEY;
  if (!key || key.length < 16) return noStore(new NextResponse(null, { status: 404 }));
  const provided = req.headers.get("x-owner-key") ?? "";
  if (!safeEqual(provided, key)) {
    return noStore(NextResponse.json({ error: "nope" }, { status: 401 }));
  }
  await markDressed(raceDate());
  return noStore(NextResponse.json({ ok: true, dressedFor: raceDate() }));
}
