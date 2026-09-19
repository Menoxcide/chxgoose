import { createHmac, timingSafeEqual } from "crypto";
import { INFO_EMAIL } from "./copy";

const SVIX_SKEW_SEC = 300;

export type ReceivedEvent = {
  type: string;
  data?: {
    email_id?: string;
    from?: string;
    to?: string[];
    subject?: string;
  };
};

export function mailFrom(): string {
  return process.env.RESEND_FROM?.trim() || `Billie <${INFO_EMAIL}>`;
}

export function alertInbox(): string[] {
  return (process.env.ALERT_EMAIL ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function verifySvix(
  payload: string,
  headers: { id: string; timestamp: string; signature: string },
  secret: string,
  nowSec = Math.floor(Date.now() / 1000),
): boolean {
  const ts = Number(headers.timestamp);
  if (!Number.isFinite(ts) || Math.abs(nowSec - ts) > SVIX_SKEW_SEC) return false;
  const raw = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  const key = Buffer.from(raw, "base64");
  if (!key.length) return false;
  const digest = createHmac("sha256", key).update(`${headers.id}.${headers.timestamp}.${payload}`).digest("base64");
  const expected = Buffer.from(`v1,${digest}`);
  return headers.signature.split(/\s+/).some((part) => {
    const got = Buffer.from(part);
    return got.length === expected.length && timingSafeEqual(got, expected);
  });
}

export function receivedEmailId(event: ReceivedEvent): string | null {
  if (event.type !== "email.received") return null;
  const id = event.data?.email_id?.trim();
  return id || null;
}
