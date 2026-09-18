import { NextResponse } from "next/server";
import { raceDate } from "@/lib/detroit";
import { markDressed } from "@/lib/db";

export async function POST(req: Request) {
  const key = process.env.OWNER_KEY;
  if (!key) return new NextResponse(null, { status: 404 });
  if (req.headers.get("x-owner-key") !== key) {
    return NextResponse.json({ error: "nope" }, { status: 401 });
  }
  await markDressed(raceDate());
  return NextResponse.json({ ok: true, dressedFor: raceDate() });
}
