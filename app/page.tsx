import { hero, yearlyCause, events, donate } from "@/content";
import { Button, SectionHead, Card, Tag } from "@/components/ui";
import NewsletterForm from "@/components/NewsletterForm";

export default function Home() {
  const nextEvent = events.find((e) => e.confirmed) ?? events[0];

  return (
    <>
      <section className="px-6 pt-20 pb-[70px] text-center">
        <div className="uppercase tracking-[0.25em] text-gold font-semibold text-xs mb-3.5">
          {hero.eyebrow}
        </div>
        <h1 className="font-display text-[clamp(2rem,5vw,3.2rem)] text-maroon m-0 mb-1.5 tracking-wide">
          {hero.heading}
        </h1>
        <p className="max-w-[640px] mx-auto my-4 text-lg text-ink">
          {hero.lead}
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button href={hero.primaryCta.href}>{hero.primaryCta.label}</Button>
          <Button href={hero.secondaryCta.href} variant="outline">
            {hero.secondaryCta.label}
          </Button>
        </div>
      </section>

      <section className="bg-cream-dark px-6 py-16">
        <SectionHead eyebrow={yearlyCause.eyebrow} heading={yearlyCause.heading} />
        <div className="max-w-[1100px] mx-auto">
          <p className="max-w-[700px] mx-auto text-center font-display italic text-[1.4rem] text-maroon leading-snug">
            &ldquo;{yearlyCause.quote}&rdquo;
          </p>
          <div className="flex gap-10 justify-center flex-wrap text-center mt-5">
            <div>
              <strong className="block font-display text-3xl text-maroon">
                {nextEvent.dateLabel}
              </strong>
              <span className="text-sm text-ink uppercase tracking-wide">
                {nextEvent.title}
              </span>
            </div>
            <div>
              <strong className="block font-display text-3xl text-maroon">
                {yearlyCause.fundraisingGoal}
              </strong>
              <span className="text-sm text-ink uppercase tracking-wide">
                Fundraising Goal
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cream-dark px-6 py-16">
        <SectionHead eyebrow="Support the Cause" heading="Ways to Give" />
        <div className="flex gap-4 justify-center flex-wrap max-w-[1100px] mx-auto">
          {donate.campaigns.map((c) => (
            <Button key={c.key} href={`/donate#${c.key}`} variant="outline">
              {c.label}
            </Button>
          ))}
        </div>
      </section>

      <section className="px-6 py-16">
        <SectionHead eyebrow="Get Involved" heading="Be Part of the Cause" />
        <div className="grid [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))] gap-7 max-w-[1100px] mx-auto">
          <Card>
            <Tag>Membership</Tag>
            <h3 className="text-maroon mt-0 text-xl font-display">
              Join Amplify 850
            </h3>
            <p>
              Sign up to get involved with fundraising, planning, and
              community events throughout the year.
            </p>
            <Button href="/join" variant="outline" className="mt-2">
              Sign Up
            </Button>
          </Card>
          <Card>
            <Tag>Events</Tag>
            <h3 className="text-maroon mt-0 text-xl font-display">
              See What&rsquo;s Coming
            </h3>
            <p>
              See the February Fine Arts &amp; Music Conference and how
              we&rsquo;re bringing FSU and Leon County together.
            </p>
            <Button href="/events" variant="outline" className="mt-2">
              View Events
            </Button>
          </Card>
          <Card>
            <Tag>Mission</Tag>
            <h3 className="text-maroon mt-0 text-xl font-display">
              Learn Our Story
            </h3>
            <p>
              Read more about why Amplify 850 exists and where the funds we
              raise actually go.
            </p>
            <Button href="/about" variant="outline" className="mt-2">
              About Us
            </Button>
          </Card>
        </div>
      </section>

      <section className="bg-cream-dark px-6 py-16">
        <SectionHead eyebrow="Stay in the Loop" heading="The Newsletter" />
        <div className="flex justify-center">
          <NewsletterForm
            variant="block"
            source="home"
            heading="The monthly from Amplify 850"
            blurb="What we raised, what's next, and where the money actually went. Once a month, unsubscribe any time."
          />
        </div>
      </section>
    </>
  );
}
