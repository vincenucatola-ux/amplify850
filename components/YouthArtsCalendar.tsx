"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import {
  DISCIPLINE_FILTERS,
  daysInMonth,
  firstDayOf,
  formatRange,
  gridDaysFor,
  monthKeysFor,
  monthName,
  monthShort,
  overlapsMonth,
  parseISO,
  parseMonthKey,
  weekdayOf,
  type CalendarEvent,
  type UndatedEvent,
} from "@/lib/calendar";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_CHIPS = 2;

type Filter = "All" | (typeof DISCIPLINE_FILTERS)[number];

// "Today's month" only exists on the client. useSyncExternalStore renders the
// server snapshot ("") during hydration, then the real value — no mismatch,
// no extra effect-driven render.
const subscribeNever = () => () => {};
const currentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};
const serverMonthKey = () => "";

function Pill({ tone, children }: { tone: "maroon" | "tan" | "gold"; children: ReactNode }) {
  const tones = {
    maroon: "bg-maroon text-cream",
    tan: "bg-tan/60 text-maroon",
    gold: "bg-gold/15 text-gold border border-gold/40",
  };
  return (
    <span
      className={`inline-block text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function AgendaItem({ e, month }: { e: CalendarEvent; month: string }) {
  const { m, d } = parseISO(e.start);
  const continues = e.start < firstDayOf(month);

  return (
    <article
      id={`evt-${e.id}`}
      className={`scroll-mt-28 flex gap-4 sm:gap-5 rounded-lg border p-4 sm:p-5 bg-cream ${
        e.amplify
          ? "border-maroon shadow-[0_2px_10px_rgba(72,31,37,0.12)]"
          : "border-cream-dark shadow-[0_2px_10px_rgba(72,31,37,0.04)]"
      }`}
    >
      <div
        className={`flex-none w-[58px] sm:w-[64px] text-center rounded-md py-2.5 px-1.5 h-fit ${
          e.amplify ? "bg-maroon text-cream" : "bg-cream-dark text-maroon"
        }`}
      >
        <div
          className={`uppercase text-[11px] tracking-wide ${e.amplify ? "text-gold-light" : "text-gold"}`}
        >
          {monthShort(m)}
        </div>
        <div className="font-display text-[1.5rem] leading-none mt-0.5">{d}</div>
      </div>

      <div className="min-w-0">
        {(e.amplify || e.free || e.regional || continues) && (
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {e.amplify && <Pill tone="maroon">Amplify 850</Pill>}
            {e.free && <Pill tone="tan">Free</Pill>}
            {e.regional && <Pill tone="gold">Regional / State</Pill>}
            {continues && <Pill tone="gold">Ongoing</Pill>}
          </div>
        )}
        <h3 className="font-display text-maroon text-lg leading-snug m-0">{e.title}</h3>
        <div className="text-sm text-gold font-semibold mt-1">
          {formatRange(e.start, e.end)}
          {e.time && ` · ${e.time}`}
        </div>
        <p className="text-sm m-0 mt-1">
          {e.host}
          {e.venue && ` · ${e.venue}`}
        </p>
        {e.cost && <p className="text-sm text-ink/70 italic m-0 mt-1">{e.cost}</p>}
        {!e.confirmed && !e.amplify && (
          <p className="text-xs text-ink/60 italic m-0 mt-1.5">
            Date listed on a school calendar — confirm with the host.
          </p>
        )}
        {e.url &&
          (e.amplify ? (
            <Link
              href={e.url}
              className="inline-block mt-2 text-sm font-semibold text-maroon underline"
            >
              Event details &rarr;
            </Link>
          ) : (
            <a
              href={e.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-sm font-semibold text-maroon underline"
            >
              More info &#8599;
            </a>
          ))}
      </div>
    </article>
  );
}

export default function YouthArtsCalendar({
  events,
  undated,
  updatedLabel,
}: {
  events: CalendarEvent[];
  undated: UndatedEvent[];
  updatedLabel: string;
}) {
  const monthKeys = useMemo(() => monthKeysFor(events), [events]);
  const [filter, setFilter] = useState<Filter>("All");

  // Opens on the current month if the calendar covers it, else the first month.
  const todayKey = useSyncExternalStore(subscribeNever, currentMonthKey, serverMonthKey);
  const defaultMonth = monthKeys.includes(todayKey) ? todayKey : monthKeys[0];
  const [picked, setPicked] = useState<string | null>(null);
  const month = picked ?? defaultMonth;

  // Amplify 850's own events always show — the filter only narrows everyone else's.
  const visible = useMemo(
    () => events.filter((e) => e.amplify || filter === "All" || e.disciplines.includes(filter)),
    [events, filter],
  );
  const visibleUndated = useMemo(
    () => undated.filter((e) => filter === "All" || e.disciplines.includes(filter)),
    [undated, filter],
  );

  const monthIndex = monthKeys.indexOf(month);
  const { y, m } = parseMonthKey(month);

  const agenda = useMemo(() => {
    const monthStart = firstDayOf(month);
    const clamp = (e: CalendarEvent) => (e.start < monthStart ? monthStart : e.start);
    return visible
      .filter((e) => overlapsMonth(e, month))
      .sort(
        (a, b) =>
          clamp(a).localeCompare(clamp(b)) ||
          Number(!!b.amplify) - Number(!!a.amplify) ||
          a.title.localeCompare(b.title),
      );
  }, [visible, month]);

  const byDay = useMemo(() => {
    const map = new Map<number, CalendarEvent[]>();
    for (const e of visible) {
      for (const d of gridDaysFor(e, month)) {
        map.set(d, [...(map.get(d) ?? []), e]);
      }
    }
    for (const list of map.values()) list.sort((a, b) => Number(!!b.amplify) - Number(!!a.amplify));
    return map;
  }, [visible, month]);

  const lead = weekdayOf(y, m, 1);
  const dim = daysInMonth(y, m);
  const cellCount = Math.ceil((lead + dim) / 7) * 7;

  return (
    <div className="max-w-[1000px] mx-auto">
      {/* Filter by art form */}
      <div role="group" aria-label="Filter by art form" className="flex flex-wrap gap-2 justify-center mb-6">
        {(["All", ...DISCIPLINE_FILTERS] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border-[1.5px] transition-colors ${
              filter === f
                ? "bg-maroon text-cream border-maroon"
                : "bg-cream text-maroon border-maroon/30 hover:border-maroon"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Month tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-6" role="tablist" aria-label="Month">
        {monthKeys.map((key, i) => {
          const { y: ky, m: km } = parseMonthKey(key);
          const count = visible.filter((e) => overlapsMonth(e, key)).length;
          const active = key === month;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setPicked(key)}
              className={`flex-none px-3.5 py-2 rounded-md text-sm font-semibold transition-colors ${
                active ? "bg-maroon text-cream" : "bg-cream-dark text-maroon hover:bg-tan/50"
              }`}
            >
              {monthShort(km)}
              {(i === 0 || km === 1) && ` ${ky}`}
              <span className={`ml-1.5 text-xs font-normal ${active ? "text-cream/75" : "text-ink/55"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Month header + prev/next */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setPicked(monthKeys[monthIndex - 1])}
          disabled={monthIndex <= 0}
          aria-label="Previous month"
          className="px-3 py-1.5 rounded border border-maroon/30 text-maroon font-semibold disabled:opacity-30"
        >
          &larr;
        </button>
        <h2 className="font-display text-maroon text-2xl m-0">
          {monthName(m)} {y}
        </h2>
        <button
          type="button"
          onClick={() => setPicked(monthKeys[monthIndex + 1])}
          disabled={monthIndex >= monthKeys.length - 1}
          aria-label="Next month"
          className="px-3 py-1.5 rounded border border-maroon/30 text-maroon font-semibold disabled:opacity-30"
        >
          &rarr;
        </button>
      </div>

      <div className="flex gap-5 justify-center text-xs text-ink/70 mb-3">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-maroon" /> Amplify 850 event
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-tan/70" /> School &amp; community event
        </span>
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-7 gap-px bg-tan/40 border border-tan/40 rounded-lg overflow-hidden mb-10">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="bg-cream-dark text-center text-[11px] sm:text-xs font-bold uppercase tracking-wide text-maroon py-1.5"
          >
            <span className="sm:hidden">{w[0]}</span>
            <span className="hidden sm:inline">{w}</span>
          </div>
        ))}
        {Array.from({ length: cellCount }, (_, i) => {
          const day = i - lead + 1;
          if (day < 1 || day > dim) {
            return <div key={i} className="bg-cream-dark/50 min-h-[52px] sm:min-h-[92px]" />;
          }
          const list = byDay.get(day) ?? [];
          return (
            <div key={i} className="bg-cream min-h-[52px] sm:min-h-[92px] p-1 sm:p-1.5 min-w-0">
              <div className="text-xs sm:text-sm font-semibold text-ink/70">{day}</div>

              <div className="hidden sm:flex flex-col gap-1 mt-1">
                {list.slice(0, MAX_CHIPS).map((e) => (
                  <a
                    key={e.id}
                    href={`#evt-${e.id}`}
                    title={e.title}
                    className={`block truncate rounded px-1.5 py-0.5 text-[11px] leading-tight ${
                      e.amplify
                        ? "bg-maroon text-cream"
                        : "bg-tan/40 text-maroon hover:bg-tan/70"
                    }`}
                  >
                    {e.title}
                  </a>
                ))}
                {list.length > MAX_CHIPS && (
                  <span className="text-[11px] text-ink/60 px-1">+{list.length - MAX_CHIPS} more</span>
                )}
              </div>

              <div className="flex flex-wrap gap-0.5 mt-1 sm:hidden">
                {list.slice(0, 4).map((e) => (
                  <span
                    key={e.id}
                    className={`inline-block w-1.5 h-1.5 rounded-full ${e.amplify ? "bg-maroon" : "bg-gold"}`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Agenda for the month */}
      <div className="flex flex-col gap-4">
        {agenda.length === 0 ? (
          <p className="text-center text-ink/60 py-8">
            No {filter === "All" ? "" : `${filter.toLowerCase()} `}events listed for {monthName(m)} yet.
          </p>
        ) : (
          agenda.map((e) => <AgendaItem key={e.id} e={e} month={month} />)
        )}
      </div>

      {/* Annual events without a 2026-27 date yet */}
      {visibleUndated.length > 0 && (
        <section className="mt-16">
          <div className="text-center mb-6">
            <div className="uppercase tracking-[0.25em] text-gold font-bold text-xs mb-2">
              Mark Your Calendar
            </div>
            <h2 className="font-display text-maroon text-2xl m-0">Annual events &mdash; dates not yet posted</h2>
          </div>
          <div className="grid [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))] gap-4">
            {visibleUndated.map((e) => (
              <article key={e.id} className="rounded-lg border border-cream-dark bg-cream p-5">
                <div className="text-xs uppercase tracking-wide text-gold font-bold mb-1">
                  Typically {e.timing.toLowerCase()}
                </div>
                <h3 className="font-display text-maroon text-lg leading-snug m-0">{e.title}</h3>
                <p className="text-sm m-0 mt-1">
                  {e.host}
                  {e.venue && ` · ${e.venue}`}
                </p>
                {e.free && <p className="text-sm text-ink/70 italic m-0 mt-1">Free</p>}
                {e.cost && <p className="text-sm text-ink/70 italic m-0 mt-1">{e.cost}</p>}
                {e.url && (
                  <a
                    href={e.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-sm font-semibold text-maroon underline"
                  >
                    More info &#8599;
                  </a>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      <p className="text-center text-sm text-ink/65 mt-14 max-w-[640px] mx-auto">
        Compiled from public school and organization calendars and last updated {updatedLabel}. Dates,
        times, and venues change &mdash; check with the host before you go. Know of an event we missed?{" "}
        <Link href="/contact" className="text-maroon font-semibold underline">
          Tell us
        </Link>
        .
      </p>
    </div>
  );
}
