import { createHash, timingSafeEqual } from "crypto";

const PROD_ORIGINS = ["https://chxgoose.com", "https://www.chxgoose.com"];

export function siteOrigin(): string {
  const fromEnv = process.env.SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL_ENV === "production") return "https://chxgoose.com";
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export function allowedOrigins(): string[] {
  const extra = siteOrigin();
  const local =
    process.env.VERCEL_ENV === "production"
      ? []
      : ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3100"];
  return [...new Set([...PROD_ORIGINS, extra, ...local])];
}

export function isAllowedOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (origin) return allowedOrigins().includes(origin);
  const referer = req.headers.get("referer");
  if (!referer) return false;
  try {
    const r = new URL(referer);
    return allowedOrigins().includes(r.origin);
  } catch {
    return false;
  }
}

export function clientIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) {
    const first = xf.split(",")[0]?.trim();
    if (first && first.length < 80) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "0.0.0.0";
}

export function ipHash(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

type Bucket = { n: number; reset: number };
const g = globalThis as unknown as { __chxLimits?: Map<string, Bucket> };

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const store = (g.__chxLimits ??= new Map());
  const now = Date.now();
  const cur = store.get(key);
  if (!cur || now >= cur.reset) {
    store.set(key, { n: 1, reset: now + windowMs });
    if (store.size > 5000) {
      for (const [k, v] of store) {
        if (now >= v.reset) store.delete(k);
      }
    }
    return true;
  }
  if (cur.n >= max) return false;
  cur.n += 1;
  return true;
}

export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    timingSafeEqual(left, Buffer.alloc(left.length));
    return false;
  }
  return timingSafeEqual(left, right);
}

export function cleanText(raw: unknown, max: number): string {
  if (typeof raw !== "string") return "";
  return raw
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export function looksLikePlaceQuery(q: string): boolean {
  if (q.length < 2 || q.length > 80) return false;
  if (/https?:|\/\/|\.\.|[<>]/.test(q)) return false;
  return /^[\p{L}\p{N}\s,'().#/-]+$/u.test(q);
}

export async function readJson<T>(req: Request, maxBytes = 4096): Promise<T | null> {
  const len = Number(req.headers.get("content-length") ?? "0");
  if (len > maxBytes) return null;
  const ctype = req.headers.get("content-type") ?? "";
  if (!ctype.toLowerCase().includes("application/json")) return null;
  const buf = Buffer.from(await req.arrayBuffer());
  if (buf.length > maxBytes) return null;
  try {
    return JSON.parse(buf.toString("utf8")) as T;
  } catch {
    return null;
  }
}

export function noStore(res: Response): Response {
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("X-Content-Type-Options", "nosniff");
  return res;
}

export const SECURITY_HEADERS: Record<string, string> = {
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "X-DNS-Prefetch-Control": "off",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://*.tile.openstreetmap.org https://tile.openstreetmap.org",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self' https://checkout.stripe.com",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; "),
};
