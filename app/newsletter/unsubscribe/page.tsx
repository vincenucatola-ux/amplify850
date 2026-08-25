/**
 * Deliberately does no database read or write. This page only renders a
 * form — the actual unsubscribe happens when that form POSTs to
 * /api/newsletter/unsubscribe. Keeping this page a pure GET with zero side
 * effects is what makes it safe for corporate mail scanners to pre-fetch
 * without silently unsubscribing anyone who never clicked.
 */
export default async function NewsletterUnsubscribeConfirm({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <section className="px-6 py-24 text-center">
        <div className="max-w-[480px] mx-auto">
          <h1 className="font-display text-maroon text-3xl mb-4">Missing unsubscribe link</h1>
          <p className="text-[1.05rem]">
            That link is missing its token. Use the unsubscribe link from the most recent email
            instead of a bookmarked one.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 py-24 text-center">
      <div className="max-w-[480px] mx-auto">
        <h1 className="font-display text-maroon text-3xl mb-4">Unsubscribe from Amplify 850?</h1>
        <p className="text-[1.05rem] mb-8">
          You'll stop getting the monthly newsletter. You can always subscribe again later.
        </p>
        <form method="post" action={`/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`}>
          <button
            type="submit"
            className="inline-block px-7 py-3 rounded font-semibold text-[0.95rem] tracking-wide bg-maroon text-cream hover:bg-maroon-light transition-colors"
          >
            Yes, unsubscribe me
          </button>
        </form>
      </div>
    </section>
  );
}
