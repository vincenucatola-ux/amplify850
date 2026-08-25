import Link from "next/link";

export const dynamic = "force-dynamic";

const REASONS: Record<string, string> = {
  invalid: "That confirmation link isn't valid — it may have already been used.",
  expired: "That confirmation link has expired. Sign up again and we'll send a fresh one.",
  missing: "That confirmation link is missing its token.",
};

export default async function NewsletterConfirmed({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; reason?: string; already?: string }>;
}) {
  const { ok, reason, already } = await searchParams;
  const success = ok === "1";

  return (
    <section className="px-6 py-24 text-center">
      <div className="max-w-[480px] mx-auto">
        <h1 className="font-display text-maroon text-3xl mb-4">
          {success ? (already === "1" ? "Already confirmed" : "You're subscribed") : "Couldn't confirm that"}
        </h1>
        <p className="text-[1.05rem] mb-8">
          {success
            ? "Thanks — you'll get the Amplify 850 newsletter about once a month. Unsubscribe any time, one click, right from the email."
            : (reason && REASONS[reason]) ?? "Something went wrong confirming that subscription."}
        </p>
        <Link href="/" className="text-maroon font-semibold underline">
          Back to the homepage
        </Link>
      </div>
    </section>
  );
}
