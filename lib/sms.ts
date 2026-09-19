export function e164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (phone.trim().startsWith("+") && digits.length >= 10) return `+${digits}`;
  throw new Error("bad phone");
}

export async function sendSms(message: string, to = process.env.ALERT_PHONE): Promise<{ ok: true; via: string }> {
  if (!to?.trim()) throw new Error("ALERT_PHONE missing");
  const phone = e164(to);
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_FROM;
  if (twilioSid && twilioToken && twilioFrom) {
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
  const key = process.env.TEXTBELT_KEY;
  if (!key) throw new Error("no sms provider");
  const res = await fetch("https://textbelt.com/text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, message, key }),
  });
  const data = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string };
  if (!res.ok || !data.success) throw new Error(data.error || `textbelt ${res.status}`);
  return { ok: true, via: "textbelt" };
}
