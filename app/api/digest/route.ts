import { NextResponse } from "next/server";
import { isCron } from "@/lib/cron";
import { previousRaceDate } from "@/lib/detroit";
import { digestMetaKey, ensureSchema, readDayStats, readMeta, writeMeta } from "@/lib/db";
import { formatDigestSms } from "@/lib/digest";
import { noStore } from "@/lib/security";
import { sendSms } from "@/lib/sms";

export async function GET(req: Request) {
  if (!isCron(req)) {
    return noStore(new NextResponse(null, { status: 404 }));
  }
  const force = new URL(req.url).searchParams.get("force") === "1";
  try {
    await ensureSchema();
    const day = previousRaceDate();
    const key = digestMetaKey(day);
    if (!force && (await readMeta(key))) {
      return noStore(NextResponse.json({ ok: true, skipped: true, day }));
    }
    const stats = await readDayStats(day);
    const text = formatDigestSms(stats);
    const sent = await sendSms(text);
    await writeMeta(key, sent.via);
    return noStore(NextResponse.json({ ok: true, day, via: sent.via, stats }));
  } catch {
    return noStore(NextResponse.json({ ok: false }, { status: 503 }));
  }
}

export const POST = GET;
