import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";

export const dynamic = "force-dynamic";

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

/** Manual click from the email body's "Unsubscribe" link. */
export async function GET(request: Request) {
  try {
    const token = new URL(request.url).searchParams.get("token");
    const ok = await unsubscribeByToken(token);
    return NextResponse.redirect(new URL(`/newsletter/unsubscribed?ok=${ok ? 1 : 0}`, request.url));
  } catch (e) {
    console.error("newsletter unsubscribe (GET): unhandled error", e);
    return NextResponse.redirect(new URL("/newsletter/unsubscribed?ok=0", request.url));
  }
}

/**
 * RFC 8058 one-click unsubscribe. Mail clients (Gmail, etc.) call this
 * automatically — with body `List-Unsubscribe=One-Click` — when a user taps
 * "Unsubscribe" in their own UI, and expect a fast 200 with no redirect and
 * no further confirmation step. Always 200 here, even on internal failure —
 * there's no UI watching this response, and a non-2xx just makes the mail
 * client retry into the same failure.
 */
export async function POST(request: Request) {
  try {
    const token = new URL(request.url).searchParams.get("token");
    await unsubscribeByToken(token);
  } catch (e) {
    console.error("newsletter unsubscribe (POST): unhandled error", e);
  }
  return new NextResponse(null, { status: 200 });
}
