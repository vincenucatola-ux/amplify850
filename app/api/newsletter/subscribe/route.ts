import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import {
  getClientIp,
  hashIp,
  isValidEmail,
  isValidSegment,
  looksLikeBot,
  normalizeEmail,
  randomToken,
} from "@/lib/validate";
import { sendEmail } from "@/lib/mailer";
import { confirmationEmail } from "@/lib/templates";

export const dynamic = "force-dynamic";

const RATE_LIMIT_WINDOW_MINUTES = 10;
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MINUTES = 5;

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

async function handle(request: Request) {
  const sql = getSql();
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return jsonError("Bad request.");
  }

  const ip = getClientIp(request.headers);
  const ipHash = hashIp(ip);

  // Bot traps: honeypot + minimum time-on-form. Fail silently with a
  // generic-looking success so scripted submitters don't learn anything.
  if (looksLikeBot({ honeypot: body.website, renderedAt: body.renderedAt })) {
    await sql`
      insert into events (type, meta, ip_hash) values ('rate_limited', ${sql.json({ reason: "bot_trap" })}, ${ipHash})
    `;
    return NextResponse.json({ ok: true, message: "Check your inbox for a confirmation link." });
  }

  // Rate limit by IP.
  const [{ count }] = await sql<{ count: string }[]>`
    select count(*)::text as count from events
    where ip_hash = ${ipHash}
      and type in ('signup', 'rate_limited')
      and created_at > now() - (${RATE_LIMIT_WINDOW_MINUTES} || ' minutes')::interval
  `;
  if (Number(count) >= RATE_LIMIT_MAX_ATTEMPTS) {
    await sql`insert into events (type, ip_hash) values ('rate_limited', ${ipHash})`;
    return jsonError("Too many attempts — try again in a few minutes.", 429);
  }

  if (!isValidEmail(body.email)) {
    return jsonError("That doesn't look like a valid email address.");
  }
  const email = normalizeEmail(body.email as string);

  const segment = isValidSegment(body.segment) ? body.segment : "community";

  if (body.ageConfirmed !== true) {
    return jsonError(
      "You must be 18 or older to subscribe. Students under 18 — ask a parent, or your school's faculty sponsor.",
    );
  }

  const source = typeof body.source === "string" ? body.source.slice(0, 40) : "unknown";
  const userAgent = request.headers.get("user-agent")?.slice(0, 300) ?? null;

  const [existing] = await sql<
    { id: string; status: string; confirm_sent_at: string | null }[]
  >`select id, status, confirm_sent_at from subscribers where email = ${email}`;

  if (existing?.status === "confirmed") {
    await sql`insert into events (subscriber_id, type, ip_hash) values (${existing.id}, 'signup', ${ipHash})`;
    return NextResponse.json({ ok: true, message: "You're already subscribed — thanks!" });
  }

  if (existing?.status === "bounced" || existing?.status === "complained") {
    // Don't resubscribe a bad address. Respond as if it worked so we don't
    // leak deliverability signal to whoever's submitting the form.
    return NextResponse.json({ ok: true, message: "Check your inbox for a confirmation link." });
  }

  if (
    existing?.status === "pending" &&
    existing.confirm_sent_at &&
    Date.now() - new Date(existing.confirm_sent_at).getTime() < RESEND_COOLDOWN_MINUTES * 60_000
  ) {
    return NextResponse.json({ ok: true, message: "Check your inbox for a confirmation link." });
  }

  const confirmToken = randomToken();
  const confirmExpires = new Date(Date.now() + 48 * 60 * 60 * 1000);

  let subscriberId: string;
  if (existing) {
    // Re-subscribing after a prior unsubscribe, or a pending signup past
    // the resend cooldown — refresh the token and consent record.
    const [row] = await sql<{ id: string }[]>`
      update subscribers set
        status = 'pending',
        segment = ${segment},
        confirm_token = ${confirmToken},
        confirm_token_expires = ${confirmExpires.toISOString()},
        confirm_sent_at = now(),
        source = ${source},
        age_confirmed = true,
        ip_hash = ${ipHash},
        user_agent = ${userAgent},
        unsubscribed_at = null
      where id = ${existing.id}
      returning id
    `;
    subscriberId = row.id;
  } else {
    const unsubToken = randomToken();
    const [row] = await sql<{ id: string }[]>`
      insert into subscribers (
        email, segment, status, confirm_token, confirm_token_expires,
        confirm_sent_at, unsub_token, source, age_confirmed, ip_hash, user_agent
      ) values (
        ${email}, ${segment}, 'pending', ${confirmToken}, ${confirmExpires.toISOString()},
        now(), ${unsubToken}, ${source}, true, ${ipHash}, ${userAgent}
      )
      returning id
    `;
    subscriberId = row.id;
  }

  const confirmUrl = `${process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter/confirm?token=${confirmToken}`;
  const { subject, html, text } = confirmationEmail({ email, confirmUrl });

  try {
    await sendEmail({ to: email, subject, html, text });
  } catch (e) {
    console.error("newsletter: failed to send confirmation email", e);
    return jsonError("Signed up, but the confirmation email failed to send. Try again shortly.", 502);
  }

  await sql`insert into events (subscriber_id, type, ip_hash) values (${subscriberId}, 'signup', ${ipHash})`;
  await sql`insert into events (subscriber_id, type, ip_hash) values (${subscriberId}, 'confirm_sent', ${ipHash})`;

  return NextResponse.json({ ok: true, message: "Check your inbox for a confirmation link." });
}

export async function POST(request: Request) {
  try {
    return await handle(request);
  } catch (e) {
    // Covers infrastructure that isn't configured yet (DATABASE_URL,
    // IP_HASH_SALT, etc.) as well as genuine outages — either way, the
    // visitor gets a clean message instead of a raw 500, and the real
    // cause is still in the function logs for whoever's debugging it.
    console.error("newsletter subscribe: unhandled error", e);
    return jsonError("Something went wrong on our end. Try again in a few minutes.", 500);
  }
}
