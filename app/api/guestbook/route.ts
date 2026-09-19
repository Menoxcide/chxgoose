import { NextResponse } from "next/server";
import { insertGuest } from "@/lib/db";
import { formatNoteSms, notifyOwner } from "@/lib/notify";
import { BOOK_COOKIE, PIN_COOKIE_OPTS, hasBookCookie } from "@/lib/pin";
import { censorText, isMostlyCensored } from "@/lib/censor";
import {
  cleanText,
  clientIp,
  ipHash,
  isAllowedOrigin,
  noStore,
  rateLimit,
  readJson,
} from "@/lib/security";

export async function POST(req: Request) {
  if (!isAllowedOrigin(req)) {
    return noStore(NextResponse.json({ error: "Couldn’t read that." }, { status: 403 }));
  }
  if (hasBookCookie(req.headers.get("cookie"))) {
    return noStore(
      NextResponse.json({ error: "You already signed the book.", alreadySigned: true }, { status: 409 }),
    );
  }
  if (!rateLimit(`book:${ipHash(clientIp(req))}`, 5, 60_000)) {
    return noStore(NextResponse.json({ error: "Slow down a second." }, { status: 429 }));
  }
  const body = await readJson<{ name?: unknown; note?: unknown; place?: unknown }>(req);
  if (!body) {
    return noStore(NextResponse.json({ error: "Couldn’t read that." }, { status: 400 }));
  }
  const name = censorText(cleanText(body.name, 40)) || "A visitor";
  const note = censorText(cleanText(body.note, 200));
  const placeRaw = censorText(cleanText(body.place, 40));
  const place = placeRaw || null;
  if (note.length < 2 || isMostlyCensored(note)) {
    return noStore(NextResponse.json({ error: "Keep it kind. Try another note." }, { status: 400 }));
  }
  if (isMostlyCensored(name) || (place && isMostlyCensored(place))) {
    return noStore(NextResponse.json({ error: "Keep it kind. Try another note." }, { status: 400 }));
  }
  if (/javascript:|data:text\/html/i.test(`${name} ${note} ${place ?? ""}`)) {
    return noStore(NextResponse.json({ error: "Write a little note." }, { status: 400 }));
  }
  try {
    await insertGuest(name, note, place);
    notifyOwner(formatNoteSms(name, note, place));
    const res = NextResponse.json({ ok: true, alreadySigned: true, name, note, place });
    res.cookies.set(BOOK_COOKIE, "1", PIN_COOKIE_OPTS);
    return noStore(res);
  } catch {
    return noStore(NextResponse.json({ error: "Couldn’t sign. Try again." }, { status: 503 }));
  }
}
