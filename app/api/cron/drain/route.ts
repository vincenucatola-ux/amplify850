import { NextResponse } from "next/server";
import { getSql, reserveSendBudget } from "@/lib/db";
import { sendEmail } from "@/lib/mailer";
import { issueEmail } from "@/lib/templates";
import { isAuthorized } from "@/lib/validate";

export const dynamic = "force-dynamic";

const BATCH_LIMIT = 200;
const MAX_ATTEMPTS = 3;

interface Delivery {
  id: string;
  subscriber_id: string;
  issue_id: string;
  email: string;
  unsub_token: string;
  subject: string;
  preheader: string | null;
  body_md: string;
}

export async function GET(request: Request) {
  if (!isAuthorized(request, "CRON_SECRET")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const sql = getSql();

  const batch = await sql<Delivery[]>`
    select
      d.id, d.subscriber_id, d.issue_id,
      s.email, s.unsub_token,
      i.subject, i.preheader, i.body_md
    from deliveries d
    join subscribers s on s.id = d.subscriber_id
    join issues i on i.id = d.issue_id
    where d.status = 'queued'
       or (d.status = 'failed' and d.attempts < ${MAX_ATTEMPTS})
    order by d.created_at asc
    limit ${BATCH_LIMIT}
  `;

  const grant = await reserveSendBudget(batch.length);
  const toSend = batch.slice(0, grant);

  let sent = 0;
  let failed = 0;
  const touchedIssueIds = new Set<string>();

  for (const delivery of toSend) {
    touchedIssueIds.add(delivery.issue_id);
    const siteUrl = (process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
    const unsubscribeUrl = `${siteUrl}/api/newsletter/unsubscribe?token=${delivery.unsub_token}`;

    try {
      const { html, text } = issueEmail({
        subject: delivery.subject,
        preheader: delivery.preheader ?? undefined,
        bodyMd: delivery.body_md,
        email: delivery.email,
        unsubscribeUrl,
      });

      const result = await sendEmail({
        to: delivery.email,
        subject: delivery.subject,
        html,
        text,
        headers: {
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      });

      await sql`
        update deliveries set status = 'sent', provider_id = ${result.id}, sent_at = now(), attempts = attempts + 1
        where id = ${delivery.id}
      `;
      sent++;
    } catch (e) {
      await sql`
        update deliveries set status = 'failed', error = ${String((e as Error).message ?? e)}, attempts = attempts + 1
        where id = ${delivery.id}
      `;
      failed++;
    }
  }

  // Flip any issue to "sent" once nothing queued/retryable remains for it.
  for (const issueId of touchedIssueIds) {
    const [{ count }] = await sql<{ count: string }[]>`
      select count(*)::text as count from deliveries
      where issue_id = ${issueId}
        and (status = 'queued' or (status = 'failed' and attempts < ${MAX_ATTEMPTS}))
    `;
    if (Number(count) === 0) {
      await sql`update issues set status = 'sent', sent_at = now() where id = ${issueId} and status != 'sent'`;
    }
  }

  const [{ count: remaining }] = await sql<{ count: string }[]>`
    select count(*)::text as count from deliveries
    where status = 'queued' or (status = 'failed' and attempts < ${MAX_ATTEMPTS})
  `;

  return NextResponse.json({ processed: toSend.length, sent, failed, remaining: Number(remaining) });
}
