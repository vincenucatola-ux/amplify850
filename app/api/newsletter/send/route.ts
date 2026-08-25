import { NextResponse } from "next/server";
import { DAILY_SEND_CAP, getSql } from "@/lib/db";
import { isAuthorized, isValidEmail, normalizeEmail, randomToken } from "@/lib/validate";

export const dynamic = "force-dynamic";

interface Issue {
  id: string;
  slug: string;
  subject: string;
  segments: string[];
  status: string;
}

async function countRecipients(issue: Issue): Promise<number> {
  const sql = getSql();
  const [{ count }] = await sql<{ count: string }[]>`
    select count(*)::text as count from subscribers
    where status = 'confirmed'
      and ('all' = any(${issue.segments}) or segment = any(${issue.segments}))
  `;
  return Number(count);
}

async function handle(request: Request) {
  const sql = getSql();
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const slug = typeof body.slug === "string" ? body.slug : "";
  const dryRun = body.dryRun === true;
  const testEmail = typeof body.testEmail === "string" ? body.testEmail : null;

  const [issue] = await sql<Issue[]>`
    select id, slug, subject, segments, status from issues where slug = ${slug}
  `;
  if (!issue) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // --- dry run: just report who would get it -------------------------------
  if (dryRun) {
    const recipients = await countRecipients(issue);
    return NextResponse.json({
      subject: issue.subject,
      segments: issue.segments,
      recipients,
      estimatedDays: Math.max(1, Math.ceil(recipients / DAILY_SEND_CAP)),
    });
  }

  // --- test send: one copy to an arbitrary address --------------------------
  if (testEmail) {
    if (!isValidEmail(testEmail)) {
      return NextResponse.json({ error: "invalid_test_email" }, { status: 400 });
    }
    const email = normalizeEmail(testEmail);

    const [existing] = await sql<{ id: string }[]>`select id from subscribers where email = ${email}`;
    let subscriberId: string;
    if (existing) {
      subscriberId = existing.id;
    } else {
      const [row] = await sql<{ id: string }[]>`
        insert into subscribers (email, segment, status, unsub_token, source, age_confirmed, confirmed_at)
        values (${email}, 'community', 'confirmed', ${randomToken()}, 'admin_test', true, now())
        returning id
      `;
      subscriberId = row.id;
    }

    await sql`
      insert into deliveries (issue_id, subscriber_id, status, attempts, error, sent_at, provider_id)
      values (${issue.id}, ${subscriberId}, 'queued', 0, null, null, null)
      on conflict (issue_id, subscriber_id) do update set
        status = 'queued', attempts = 0, error = null, sent_at = null, provider_id = null
    `;
    return NextResponse.json({ queued: 1 });
  }

  // --- the real send ---------------------------------------------------------
  if (issue.status === "sent") {
    return NextResponse.json({ error: "already_sent" }, { status: 409 });
  }
  if (issue.status === "sending") {
    return NextResponse.json({ error: "already_sending" }, { status: 409 });
  }

  await sql`update issues set status = 'sending', queued_at = now() where id = ${issue.id}`;

  await sql`
    insert into deliveries (issue_id, subscriber_id)
    select ${issue.id}, s.id from subscribers s
    where s.status = 'confirmed'
      and ('all' = any(${issue.segments}) or s.segment = any(${issue.segments}))
      and not exists (
        select 1 from deliveries d where d.issue_id = ${issue.id} and d.subscriber_id = s.id
      )
    on conflict (issue_id, subscriber_id) do nothing
  `;

  const [{ count }] = await sql<{ count: string }[]>`
    select count(*)::text as count from deliveries where issue_id = ${issue.id}
  `;
  const recipients = Number(count);

  return NextResponse.json({
    recipients,
    estimatedDays: Math.max(1, Math.ceil(recipients / DAILY_SEND_CAP)),
  });
}

export async function POST(request: Request) {
  if (!isAuthorized(request, "ADMIN_SECRET")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    return await handle(request);
  } catch (e) {
    console.error("newsletter send: unhandled error", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
