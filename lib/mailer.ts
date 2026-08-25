/**
 * Resend / Brevo adapter over plain fetch — no provider SDK, so this file is
 * the only place that needs to change if the provider does. Pick with
 * MAIL_PROVIDER=resend|brevo (defaults to resend).
 */

export interface SendResult {
  id: string;
}

export interface SendInput {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** RFC 8058 one-click unsubscribe headers, set by the caller per-message. */
  headers?: Record<string, string>;
}

export const DAILY_CAP_BY_PROVIDER: Record<string, number> = {
  resend: 100,
  brevo: 300,
};

function fromAddress(): string {
  return process.env.MAIL_FROM ?? "Amplify 850 <news@amplify850.org>";
}

export async function sendEmail(input: SendInput): Promise<SendResult> {
  const provider = (process.env.MAIL_PROVIDER ?? "resend").toLowerCase();
  if (provider === "brevo") return sendViaBrevo(input);
  return sendViaResend(input);
}

async function sendViaResend(input: SendInput): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set.");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress(),
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      headers: input.headers,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
  if (!res.ok) throw new Error(`Resend ${res.status}: ${data.message ?? JSON.stringify(data)}`);
  return { id: data.id ?? "unknown" };
}

async function sendViaBrevo(input: SendInput): Promise<SendResult> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error("BREVO_API_KEY is not set.");

  const match = /^(.*)<(.+)>$/.exec(fromAddress());
  const senderName = match ? match[1].trim() : "Amplify 850";
  const senderEmail = match ? match[2].trim() : fromAddress();

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: input.to }],
      subject: input.subject,
      htmlContent: input.html,
      textContent: input.text,
      headers: input.headers,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as { messageId?: string; message?: string };
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${data.message ?? JSON.stringify(data)}`);
  return { id: data.messageId ?? "unknown" };
}
