import { NextResponse } from "next/server";
import { raceDate } from "@/lib/detroit";
import { ensureSchema, recordVisit } from "@/lib/db";
import { clientIp, ipHash, noStore, rateLimit } from "@/lib/security";

const BOT = /bot|crawl|spider|preview|slurp|facebookexternalhit|twitterbot|discord|slackbot|bytespider/i;

export async function POST(req: Request) {
  const ua = req.headers.get("user-agent") ?? "";
  if (BOT.test(ua)) return noStore(NextResponse.json({ ok: true, skipped: true }));
  const ip = clientIp(req);
  if (!rateLimit(`hit:${ip}`, 20, 60_000)) {
    return noStore(NextResponse.json({ ok: false }, { status: 429 }));
  }
  try {
    await ensureSchema();
    await recordVisit(raceDate(), ipHash(`${ip}|${ua.slice(0, 180)}`));
    return noStore(NextResponse.json({ ok: true }));
  } catch {
    return noStore(NextResponse.json({ ok: false }, { status: 503 }));
  }
}
