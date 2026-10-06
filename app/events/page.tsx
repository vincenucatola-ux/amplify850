import { events } from "@/content";
import { SectionHead, Button, Tag } from "@/components/ui";
import NewsletterForm from "@/components/NewsletterForm";

function monthDay(dateLabel: string) {
  const match = dateLabel.match(/([A-Za-z]+)\s+(\d+)/);
  return match ? { month: match[1].slice(0, 3), day: match[2] } : null;
}

export default function Events() {
  return (
    <section className="px-6 py-16">
      <SectionHead eyebrow="What's Coming" heading="Events" />
      <div className="max-w-[820px] mx-auto flex flex-col gap-6">
        {events.map((event) => {
          const md = monthDay(event.dateLabel);
          return (
            <div
              key={event.slug}
              className="flex flex-col sm:flex-row gap-6 bg-cream border border-cream-dark rounded-lg p-7 shadow-[0_2px_10px_rgba(72,31,37,0.05)]"
            >
              <div className="flex-none w-[90px] text-center bg-maroon text-cream rounded-md py-3.5 px-2 h-fit">
                <div className="uppercase text-xs tracking-wide text-gold-light">
                  {md?.month ?? "TBD"}
                </div>
                <div className="font-display text-[1.8rem] leading-none my-1">
                  {md?.day ?? "?"}
                </div>
              </div>
              <div>
                {event.free && <Tag>Free</Tag>}
                <h3 className="text-maroon m-0 mb-1.5 font-display text-xl">
                  {event.title}
                </h3>
                <div className="text-sm text-gold font-semibold mb-2.5">
                  {event.dateLabel}
                  {event.time && ` · ${event.time}`} · {event.location}
                  {!event.confirmed && (
                    <span className="ml-2 text-ink/60 font-normal italic">
                      (tentative)
                    </span>
                  )}
                </div>
                <p className="mb-3">{event.description}</p>
                {event.ticketUrl && (
                  <Button href={event.ticketUrl} variant="outline">
                    Tickets on Zeffy
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="max-w-[720px] mx-auto mt-10 text-center bg-cream-dark border border-dashed border-tan rounded-lg py-5 px-6 text-[0.95rem]">
        Exact venues and full programs are still being finalized — check back
        or follow the Zeffy page for the latest ticket and schedule info.
      </div>

      <div className="mt-14 flex justify-center">
        <NewsletterForm
          variant="block"
          source="events"
          heading="Know before everyone else"
          blurb="Conference dates, masterclass sign-ups, and chapter results. Once a month."
        />
      </div>
    </section>
  );
}
