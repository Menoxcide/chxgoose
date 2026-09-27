import { NextResponse } from "next/server";
import {
  applyOwnerUpdate,
  ensureSchema,
  getSql,
  readOrder,
  readWearing,
  readWearingCaption,
} from "@/lib/db";
import { parseOwnerBody } from "@/lib/ownerUpdate";
import {
  clientIp,
  ipHash,
  isAllowedOrigin,
  noStore,
  rateLimit,
  readJson,
  safeEqual,
} from "@/lib/security";

function ownerKey(): string | null {
  const key = process.env.OWNER_KEY;
  if (!key || key.length < 16) return null;
  return key;
}

function allowed(req: Request): boolean {
  const key = ownerKey();
  if (!key) return false;
  return safeEqual(req.headers.get("x-owner-key") ?? "", key);
}

async function desk() {
  const [caption, wearing, order] = await Promise.all([
    readWearingCaption(),
    readWearing(),
    readOrder(),
  ]);
  return { caption: caption ?? "", wearing, order };
}

export async function GET(req: Request) {
  if (!ownerKey()) return noStore(new NextResponse(null, { status: 404 }));
  if (!isAllowedOrigin(req)) return noStore(NextResponse.json({ error: "nope" }, { status: 403 }));
  if (!rateLimit(`owner:${ipHash(clientIp(req))}`, 20, 60_000)) {
    return noStore(NextResponse.json({ error: "Slow down a second." }, { status: 429 }));
  }
  if (!allowed(req)) return noStore(NextResponse.json({ error: "nope" }, { status: 401 }));
  if (!getSql()) return noStore(NextResponse.json({ error: "Desk is offline." }, { status: 503 }));
  await ensureSchema();
  return noStore(NextResponse.json(await desk()));
}

export async function POST(req: Request) {
  if (!ownerKey()) return noStore(new NextResponse(null, { status: 404 }));
  if (!isAllowedOrigin(req)) return noStore(NextResponse.json({ error: "nope" }, { status: 403 }));
  if (!rateLimit(`owner:${ipHash(clientIp(req))}`, 20, 60_000)) {
    return noStore(NextResponse.json({ error: "Slow down a second." }, { status: 429 }));
  }
  if (!allowed(req)) return noStore(NextResponse.json({ error: "nope" }, { status: 401 }));
  if (!getSql()) return noStore(NextResponse.json({ error: "Desk is offline." }, { status: 503 }));
  const body = await readJson(req);
  const parsed = parseOwnerBody(body);
  if (!parsed.ok) return noStore(NextResponse.json({ error: parsed.error }, { status: 400 }));
  await ensureSchema();
  await applyOwnerUpdate(parsed.update);
  return noStore(NextResponse.json(await desk()));
}
