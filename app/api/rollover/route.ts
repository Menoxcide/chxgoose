import { NextResponse } from "next/server";
import { isCron } from "@/lib/cron";
import { ensureSchema, performRollover } from "@/lib/db";
import { noStore } from "@/lib/security";

export async function GET(req: Request) {
  if (!isCron(req)) {
    return noStore(new NextResponse(null, { status: 404 }));
  }
  try {
    await ensureSchema();
    const result = await performRollover();
    return noStore(NextResponse.json({ ok: true, ...result }));
  } catch {
    return noStore(NextResponse.json({ ok: false }, { status: 503 }));
  }
}

export const POST = GET;
