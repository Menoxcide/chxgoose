import { NextResponse } from "next/server";
import { ensureSchema, performRollover } from "@/lib/db";
import { noStore, safeEqual } from "@/lib/security";

function isCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") ?? "";
  if (secret && secret.length >= 16 && auth.startsWith("Bearer ")) {
    return safeEqual(auth.slice(7), secret);
  }
  if (req.headers.get("x-vercel-cron") === "1") return true;
  const ua = req.headers.get("user-agent") ?? "";
  return ua.startsWith("vercel-cron/");
}

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
