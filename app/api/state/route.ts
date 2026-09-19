import { NextResponse } from "next/server";
import { hasBookCookie, hasPinCookie } from "@/lib/pin";
import { loadState } from "@/lib/state";

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie");
  const state = await loadState(new Date(), hasPinCookie(cookie), hasBookCookie(cookie));
  return NextResponse.json(state);
}
