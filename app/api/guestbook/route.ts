import { NextResponse } from "next/server";
import { insertGuest } from "@/lib/db";
import { BOOK_COOKIE, PIN_COOKIE_OPTS, hasBookCookie } from "@/lib/pin";

function clean(raw: unknown, max: number): string {
  if (typeof raw !== "string") return "";
  return raw.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, max);
}

export async function POST(req: Request) {
  if (hasBookCookie(req.headers.get("cookie"))) {
    return NextResponse.json(
      { error: "You already signed the book.", alreadySigned: true },
      { status: 409 },
    );
  }
  let body: { name?: unknown; note?: unknown; place?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Couldn’t read that." }, { status: 400 });
  }
  const name = clean(body.name, 40) || "A visitor";
  const note = clean(body.note, 200);
  const place = clean(body.place, 40) || null;
  if (note.length < 2) {
    return NextResponse.json({ error: "Write a little note." }, { status: 400 });
  }
  try {
    await insertGuest(name, note, place);
    const res = NextResponse.json({ ok: true, alreadySigned: true, name, note, place });
    res.cookies.set(BOOK_COOKIE, "1", PIN_COOKIE_OPTS);
    return res;
  } catch {
    return NextResponse.json({ error: "Couldn’t sign. Try again." }, { status: 503 });
  }
}
