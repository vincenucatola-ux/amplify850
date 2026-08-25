import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { isAuthorized, isValidIssueSegment } from "@/lib/validate";

export const dynamic = "force-dynamic";

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

async function handle(request: Request) {
  const sql = getSql();
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const slug = typeof body.slug === "string" ? body.slug : "";
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const preheader = typeof body.preheader === "string" ? body.preheader : "";
  const bodyMd = typeof body.bodyMd === "string" ? body.bodyMd : "";
  const segments = Array.isArray(body.segments) ? body.segments : ["all"];

  if (!SLUG_RE.test(slug)) {
    return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
  }
  if (!subject) {
    return NextResponse.json({ error: "missing_subject" }, { status: 400 });
  }
  if (!bodyMd.trim()) {
    return NextResponse.json({ error: "missing_body" }, { status: 400 });
  }
  if (!segments.every(isValidIssueSegment)) {
    return NextResponse.json({ error: "invalid_segments" }, { status: 400 });
  }

  const [existing] = await sql<{ id: string; status: string }[]>`
    select id, status from issues where slug = ${slug}
  `;

  if (existing?.status === "sent") {
    return NextResponse.json({ error: "already_sent" }, { status: 409 });
  }
  if (existing?.status === "sending") {
    return NextResponse.json({ error: "already_sending" }, { status: 409 });
  }

  if (existing) {
    await sql`
      update issues set subject = ${subject}, preheader = ${preheader}, body_md = ${bodyMd}, segments = ${segments}
      where id = ${existing.id}
    `;
    return NextResponse.json({ status: "updated" });
  }

  await sql`
    insert into issues (slug, subject, preheader, body_md, segments)
    values (${slug}, ${subject}, ${preheader}, ${bodyMd}, ${segments})
  `;
  return NextResponse.json({ status: "created" });
}

export async function POST(request: Request) {
  if (!isAuthorized(request, "ADMIN_SECRET")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    return await handle(request);
  } catch (e) {
    console.error("newsletter issues: unhandled error", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
