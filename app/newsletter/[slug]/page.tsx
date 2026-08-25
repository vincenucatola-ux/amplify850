import { notFound } from "next/navigation";
import Link from "next/link";
import { getSql } from "@/lib/db";
import { markdownToWebHtml } from "@/lib/markdown";

export const dynamic = "force-dynamic";

interface IssueRow {
  subject: string;
  sent_at: string;
  body_md: string;
}

async function getIssue(slug: string): Promise<IssueRow | null> {
  try {
    const sql = getSql();
    const [row] = await sql<IssueRow[]>`
      select subject, sent_at, body_md from issues
      where slug = ${slug} and status = 'sent'
    `;
    return row ?? null;
  } catch (e) {
    console.error("newsletter issue: could not load", e);
    return null;
  }
}

export default async function NewsletterIssue({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const issue = await getIssue(slug);
  if (!issue) notFound();

  return (
    <section className="px-6 py-16">
      <div className="max-w-[680px] mx-auto">
        <Link href="/newsletter" className="text-sm text-gold font-semibold hover:underline">
          &larr; All issues
        </Link>

        <div className="text-xs uppercase tracking-wide text-gold font-semibold mt-6 mb-2">
          {new Date(issue.sent_at).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </div>
        <h1 className="font-display text-maroon text-[clamp(1.6rem,4vw,2.4rem)] mb-8">
          {issue.subject}
        </h1>

        <div
          className="newsletter-body"
          dangerouslySetInnerHTML={{ __html: markdownToWebHtml(issue.body_md) }}
        />
      </div>
    </section>
  );
}
