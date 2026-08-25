import Link from "next/link";
import { getSql } from "@/lib/db";
import { SectionHead } from "@/components/ui";
import NewsletterForm from "@/components/NewsletterForm";

export const dynamic = "force-dynamic";

interface IssueRow {
  slug: string;
  subject: string;
  sent_at: string;
}

async function getSentIssues(): Promise<IssueRow[]> {
  const sql = getSql();
  return sql<IssueRow[]>`
    select slug, subject, sent_at from issues
    where status = 'sent'
    order by sent_at desc
  `;
}

export default async function NewsletterArchive() {
  // DATABASE_URL isn't set up yet in every environment this runs in — fail
  // soft into an empty archive rather than a hard 500 while that's pending.
  let issues: IssueRow[] = [];
  try {
    issues = await getSentIssues();
  } catch (e) {
    console.error("newsletter archive: could not load issues", e);
  }

  return (
    <section className="px-6 py-16">
      <SectionHead eyebrow="Once a Month" heading="The Newsletter" />

      {issues.length > 0 && (
        <div className="max-w-[720px] mx-auto mb-14">
          <ul className="flex flex-col gap-4">
            {issues.map((issue) => (
              <li key={issue.slug}>
                <Link
                  href={`/newsletter/${issue.slug}`}
                  className="block bg-cream border border-cream-dark rounded-lg p-6 hover:border-gold transition-colors"
                >
                  <div className="text-xs uppercase tracking-wide text-gold font-semibold mb-1.5">
                    {new Date(issue.sent_at).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  <h3 className="font-display text-maroon text-xl m-0">{issue.subject}</h3>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-center">
        <NewsletterForm
          variant="block"
          source="newsletter"
          heading="Subscribe"
          blurb="One email a month. Unsubscribe any time, one click."
        />
      </div>
    </section>
  );
}
