import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getSql } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Resend delivers webhooks via Svix. The signature scheme (documented at
 * https://docs.svix.com/receiving/verifying-payloads/how-manual):
 *   signedContent = "{svix-id}.{svix-timestamp}.{raw body}"
 *   secret        = base64-decoded, after stripping the "whsec_" prefix
 *   signature     = base64(HMAC-SHA256(secret, signedContent))
 * The header carries one or more "v1,<base64>" candidates, space-separated —
 * check the payload against all of them.
 */
function verifySvixSignature(opts: {
  secret: string;
  id: string;
  timestamp: string;
  body: string;
  signatureHeader: string;
}): boolean {
  const secretBytes = Buffer.from(opts.secret.replace(/^whsec_/, ""), "base64");
  const signedContent = `${opts.id}.${opts.timestamp}.${opts.body}`;
  const expected = createHmac("sha256", secretBytes).update(signedContent).digest();

  return opts.signatureHeader
    .split(" ")
    .map((part) => part.split(",")[1])
    .filter(Boolean)
    .some((candidate) => {
      const candidateBytes = Buffer.from(candidate, "base64");
      return candidateBytes.length === expected.length && timingSafeEqual(candidateBytes, expected);
    });
}

interface ResendEvent {
  type: string;
  data?: { email_id?: string };
}

export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "not_configured" }, { status: 500 });

  const id = request.headers.get("svix-id");
  const timestamp = request.headers.get("svix-timestamp");
  const signature = request.headers.get("svix-signature");
  const rawBody = await request.text();

  if (!id || !timestamp || !signature) {
    return NextResponse.json({ error: "missing_signature_headers" }, { status: 400 });
  }
  if (!verifySvixSignature({ secret, id, timestamp, body: rawBody, signatureHeader: signature })) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  let event: ResendEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const emailId = event.data?.email_id;
  const newStatus =
    event.type === "email.bounced" ? "bounced" : event.type === "email.complained" ? "complained" : null;

  // Always 200 on anything we don't act on — Resend retries on non-2xx, and
  // there's no reason to make it retry an event type we don't care about.
  if (!newStatus || !emailId) return NextResponse.json({ ok: true });

  const sql = getSql();
  const [delivery] = await sql<{ id: string; subscriber_id: string }[]>`
    select id, subscriber_id from deliveries where provider_id = ${emailId}
  `;
  if (!delivery) return NextResponse.json({ ok: true, note: "unknown_delivery" });

  await sql`update deliveries set status = ${newStatus} where id = ${delivery.id}`;
  await sql`update subscribers set status = ${newStatus} where id = ${delivery.subscriber_id}`;
  await sql`
    insert into events (subscriber_id, type, meta)
    values (${delivery.subscriber_id}, ${event.type === "email.bounced" ? "bounce" : "complaint"}, ${sql.json({ emailId })})
  `;

  return NextResponse.json({ ok: true });
}
