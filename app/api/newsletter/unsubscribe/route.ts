import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";

export const dynamic = "force-dynamic";

const ONE_CLICK_BODY = "List-Unsubscribe=One-Click";

async function unsubscribeByToken(token: string | null): Promise<boolean> {
  if (!token) return false;
  const sql = getSql();
  const [subscriber] = await sql<{ id: string }[]>`
    update subscribers set status = 'unsubscribed', unsubscribed_at = now()
    where unsub_token = ${token} and status != 'unsubscribed'
    returning id
  `;
  if (subscriber) {
    await sql`insert into events (subscriber_id, type) values (${subscriber.id}, 'unsubscribe')`;
    return true;
  }
  // Token valid but already unsubscribed still counts as success — idempotent.
  const [already] = await sql<{ id: string }[]>`
    select id from subscribers where unsub_token = ${token}
  `;
  return Boolean(already);
}

/**
 * GET must never mutate. Corporate mail scanners (Defender Safe Links,
 * Proofpoint, Mimecast, etc.) pre-fetch every link in an email before it
 * reaches the inbox — a GET that unsubscribes silently removes people who
 * never clicked anything. This just forwards to the confirmation page,
 * which is the only thing that renders on GET; the actual unsubscribe only
 * happens from that page's POST.
 */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  return NextResponse.redirect(
    new URL(`/newsletter/unsubscribe?token=${encodeURIComponent(token)}`, request.url),
  );
}

/**
 * The only thing that actually unsubscribes anyone. Two callers hit this:
 *  1. RFC 8058 one-click — Gmail/Yahoo POST here automatically with body
 *     exactly "List-Unsubscribe=One-Click" when a user taps their own
 *     "Unsubscribe" UI. Must stay a fast 200, no redirect, no confirmation
 *     step, and must succeed even if something upstream fails — a non-2xx
 *     just makes the mail client retry into the same failure.
 *  2. The confirmation page's own form submit (a real browser navigation),
 *     which should land the person on a real result page, not a blank 200.
 */
export async function POST(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  const rawBody = await request.text().catch(() => "");
  const isOneClick = rawBody.trim() === ONE_CLICK_BODY;

  let ok = false;
  try {
    ok = await unsubscribeByToken(token);
  } catch (e) {
    console.error("newsletter unsubscribe (POST): unhandled error", e);
  }

  if (isOneClick) {
    return new NextResponse(null, { status: 200 });
  }

  return NextResponse.redirect(new URL(`/newsletter/unsubscribed?ok=${ok ? 1 : 0}`, request.url), {
    status: 303,
  });
}
