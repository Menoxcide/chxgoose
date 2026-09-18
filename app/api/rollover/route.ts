import { NextResponse } from "next/server";
import { ensureSchema, performRollover } from "@/lib/db";

export async function GET() {
  try {
    await ensureSchema();
    const result = await performRollover();
    return NextResponse.json({ ok: true, ...result });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}

export const POST = GET;
