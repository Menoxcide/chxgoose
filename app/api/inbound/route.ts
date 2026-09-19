import { NextResponse } from "next/server";
import { INFO_EMAIL } from "@/lib/copy";
import { alertInbox, mailFrom, receivedEmailId, verifySvix, type ReceivedEvent } from "@/lib/inbound";
import { noStore } from "@/lib/security";

export async function POST(req: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET?.trim();
  if (!secret) return noStore(new NextResponse(null, { status: 404 }));

  const payload = await req.text();
  const id = req.headers.get("svix-id");
  const timestamp = req.headers.get("svix-timestamp");
  const signature = req.headers.get("svix-signature");
  if (!id || !timestamp || !signature) {
    return noStore(new NextResponse(null, { status: 400 }));
  }
  if (!verifySvix(payload, { id, timestamp, signature }, secret)) {
    return noStore(new NextResponse(null, { status: 401 }));
  }

  let event: ReceivedEvent;
  try {
    event = JSON.parse(payload) as ReceivedEvent;
  } catch {
    return noStore(new NextResponse(null, { status: 400 }));
  }

  const emailId = receivedEmailId(event);
  if (!emailId) return noStore(NextResponse.json({ ok: true, skipped: true }));

  const to = alertInbox();
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey || !to.length) {
    return noStore(NextResponse.json({ ok: false, error: "no inbox" }, { status: 503 }));
  }

  const forwarded = await forwardReceived(apiKey, emailId, event, to);
  if (!forwarded.ok) {
    console.error("inbound", forwarded.error);
    return noStore(NextResponse.json({ ok: false, error: forwarded.error }, { status: 503 }));
  }
  return noStore(NextResponse.json({ ok: true }));
}

async function forwardReceived(
  apiKey: string,
  emailId: string,
  event: ReceivedEvent,
  to: string[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  const headers = { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" };
  const got = await fetch(`https://api.resend.com/emails/receiving/${emailId}`, { headers });
  if (!got.ok) return { ok: false, error: `receive ${got.status}` };
  const email = (await got.json()) as {
    subject?: string | null;
    html?: string | null;
    text?: string | null;
    from?: string | null;
  };
  const subject = email.subject || event.data?.subject || "(no subject)";
  const fromAddr = event.data?.from || email.from || "";
  const text =
    email.text ||
    `A note landed at ${INFO_EMAIL}.\nFrom: ${fromAddr}\nSubject: ${subject}`;
  const sent = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers,
    body: JSON.stringify({
      from: mailFrom(),
      to,
      reply_to: fromAddr || undefined,
      subject: subject.startsWith("Billie:") ? subject : `Billie: ${subject}`,
      text,
      html: email.html || undefined,
    }),
  });
  if (!sent.ok) return { ok: false, error: `send ${sent.status}` };
  return { ok: true };
}
