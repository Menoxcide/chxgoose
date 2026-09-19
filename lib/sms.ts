export function e164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (phone.trim().startsWith("+") && digits.length >= 10) return `+${digits}`;
  throw new Error("bad phone");
}

export function verizonMmsEmail(phone: string): string {
  return `${e164(phone).replace(/^\+1/, "")}@vzwpix.com`;
}

async function sendTwilio(phone: string, message: string): Promise<{ ok: true; via: string } | null> {
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_FROM;
  if (!twilioSid || !twilioToken || !twilioFrom) return null;
  const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64");
  const body = new URLSearchParams({
    To: phone,
    From: twilioFrom,
    Body: message,
  });
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  if (!res.ok) throw new Error(`twilio ${res.status}`);
  return { ok: true, via: "twilio" };
}

async function sendResendGateway(phone: string, message: string): Promise<{ ok: true; via: string } | null> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  const to = process.env.ALERT_SMS_EMAIL?.trim() || verizonMmsEmail(phone);
  const from = process.env.RESEND_FROM?.trim() || "Billie <onboarding@justindkamen.com>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject: "Billie", text: message }),
  });
  if (!res.ok) throw new Error(`resend ${res.status}`);
  return { ok: true, via: "resend-mms" };
}

async function sendTextbelt(phone: string, message: string): Promise<{ ok: true; via: string } | null> {
  const key = process.env.TEXTBELT_KEY;
  if (!key) return null;
  const res = await fetch("https://textbelt.com/text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, message, key }),
  });
  const data = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string };
  if (!res.ok || !data.success) throw new Error(data.error || `textbelt ${res.status}`);
  return { ok: true, via: "textbelt" };
}

export async function sendSms(message: string, to = process.env.ALERT_PHONE): Promise<{ ok: true; via: string }> {
  if (!to?.trim()) throw new Error("ALERT_PHONE missing");
  const phone = e164(to);
  const sent =
    (await sendTwilio(phone, message)) ||
    (await sendResendGateway(phone, message)) ||
    (await sendTextbelt(phone, message));
  if (!sent) throw new Error("no sms provider");
  return sent;
}
