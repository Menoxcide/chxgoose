import { safeEqual } from "./security";

export function isCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") ?? "";
  if (secret && secret.length >= 16 && auth.startsWith("Bearer ")) {
    return safeEqual(auth.slice(7), secret);
  }
  if (req.headers.get("x-vercel-cron") === "1") return true;
  const ua = req.headers.get("user-agent") ?? "";
  return ua.startsWith("vercel-cron/");
}
