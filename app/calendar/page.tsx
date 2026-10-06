import type { Metadata } from "next";
import { events as siteEvents } from "@/content";
import { calendarEvents, calendarUpdated, undatedEvents } from "@/content/calendar-data";
import { monthName, parseISO, type CalendarEvent } from "@/lib/calendar";
import { SectionHead } from "@/components/ui";
import YouthArtsCalendar from "@/components/YouthArtsCalendar";

export const metadata: Metadata = {
  title: "Youth Arts Calendar | Amplify 850",
  description:
    "School concerts, productions, and festivals for young artists across Leon County — alongside Amplify 850's own events.",
};

export default function CalendarPage() {
  // Amplify 850's own events come from content.ts, so editing them there
  // updates /events and this calendar together.
  const ours: CalendarEvent[] = siteEvents.flatMap((e) =>
    e.isoDate
      ? [
          {
            id: `amplify-${e.slug}`,
            title: e.title,
            start: e.isoDate,
            time: e.time,
            host: "Amplify 850",
            disciplines: [],
            venue: e.location,
            free: e.free,
            confirmed: e.confirmed,
            url: "/events",
            amplify: true,
          },
        ]
      : [],
  );

  const { y, m } = parseISO(calendarUpdated);

  return (
    <section className="px-6 py-16">
      <SectionHead eyebrow="Around Tallahassee" heading="Youth Arts Calendar" />
      <p className="text-center max-w-[640px] mx-auto mb-10 text-[1.05rem]">
        School concerts, productions, and festivals for young artists across Leon County this year
        &mdash; with Amplify 850&rsquo;s own events highlighted alongside them.
      </p>
      <YouthArtsCalendar
        events={[...calendarEvents, ...ours]}
        undated={undatedEvents}
        updatedLabel={`${monthName(m)} ${y}`}
      />
    </section>
  );
}
