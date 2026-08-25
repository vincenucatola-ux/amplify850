import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NewsletterUnsubscribed({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const { ok } = await searchParams;
  const success = ok === "1";

  return (
    <section className="px-6 py-24 text-center">
      <div className="max-w-[480px] mx-auto">
        <h1 className="font-display text-maroon text-3xl mb-4">
          {success ? "You're unsubscribed" : "Couldn't process that"}
        </h1>
        <p className="text-[1.05rem] mb-8">
          {success
            ? "You won't get any more monthly emails from Amplify 850. If that was a mistake, you can subscribe again any time."
            : "That unsubscribe link isn't valid. If you're still getting emails you don't want, use the link in the most recent one."}
        </p>
        <Link href="/newsletter" className="text-maroon font-semibold underline">
          Back to the newsletter
        </Link>
      </div>
    </section>
  );
}
