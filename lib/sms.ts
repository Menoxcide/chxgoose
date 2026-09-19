export function e164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (phone.trim().startsWith("+") && digits.length >= 10) return `+${digits}`;
  throw new Error("bad phone");
}

export function attMmsEmail(phone: string): string {
  const ten = e164(phone).replace(/^\+1/, "");
  return `${ten}@mms.att.net`;
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

async function sendEmail(message: string): Promise<{ ok: true; via: string } | null> {
  const apiKey = process.env.RESEND_API_KEY;
  const toRaw = process.env.ALERT_EMAIL?.trim();
  if (!apiKey || !toRaw) return null;
  const to = toRaw.split(",").map((s) => s.trim()).filter(Boolean);
  const from = process.env.RESEND_FROM?.trim() || "Billie <onboarding@justindkamen.com>";
  const subject = message.split("\n")[0]?.slice(0, 80) || "Billie";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, text: message }),
  });
  if (!res.ok) throw new Error(`resend ${res.status}`);
  return { ok: true, via: "email" };
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
  if (!res.ok || !data.success) {
    console.error("textbelt", data.error || res.status);
    return null;
  }
  return { ok: true, via: "textbelt" };
}

export async function sendAlert(message: string): Promise<{ ok: true; via: string }> {
  const phone = process.env.ALERT_PHONE?.trim();
  if (phone) {
    try {
      const twilio = await sendTwilio(e164(phone), message);
      if (twilio) return twilio;
    } catch (err) {
      console.error("twilio", err instanceof Error ? err.message : "fail");
    }
    try {
      const textbelt = await sendTextbelt(e164(phone), message);
      if (textbelt) return textbelt;
    } catch (err) {
      console.error("textbelt", err instanceof Error ? err.message : "fail");
    }
  }
  const email = await sendEmail(message);
  if (email) return email;
  throw new Error("no alert provider");
}

/** @deprecated use sendAlert */
export const sendSms = sendAlert;
