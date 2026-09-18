import { NextResponse } from "next/server";
import { hasPinCookie } from "@/lib/pin";
import { loadState } from "@/lib/state";

export async function GET(req: Request) {
  const state = await loadState(new Date(), hasPinCookie(req.headers.get("cookie")));
  return NextResponse.json(state);
}
