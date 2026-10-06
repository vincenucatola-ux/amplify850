/**
 * Types and date helpers for the /calendar page. Dates are plain
 * "YYYY-MM-DD" strings throughout — never parsed with `new Date(string)`,
 * which reads them as UTC and can land an event on the wrong day.
 */

export interface CalendarEvent {
  id: string;
  title: string;
  /** YYYY-MM-DD */
  start: string;
  /** YYYY-MM-DD, only for multi-day events */
  end?: string;
  time?: string;
  host: string;
  /** Filter keys — see DISCIPLINE_FILTERS */
  disciplines: string[];
  venue?: string;
  cost?: string;
  free?: boolean;
  /** false = date came from a school calendar and should be confirmed with the host */
  confirmed: boolean;
  url?: string;
  /** Happens outside Tallahassee (district/state level) */
  regional?: boolean;
  /** One of Amplify 850's own events — always shown, never filtered out */
  amplify?: boolean;
}

export interface UndatedEvent {
  id: string;
  title: string;
  host: string;
  disciplines: string[];
  /** Loose timing, e.g. "Early May" */
  timing: string;
  venue?: string;
  cost?: string;
  free?: boolean;
  url?: string;
}

export const DISCIPLINE_FILTERS = [
  "Band",
  "Choral",
  "Orchestra",
  "Theatre",
  "Dance",
  "Visual Art",
  "Other Music",
  "Multi-arts",
] as const;

/** Events this many days long or shorter show on every day they run in the grid. */
export const GRID_MULTIDAY_MAX = 4;

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const pad = (n: number) => String(n).padStart(2, "0");

export function parseISO(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
}

export function toISO(y: number, m: number, d: number) {
  return `${y}-${pad(m)}-${pad(d)}`;
}

/** "2026-10" */
export function monthKeyOf(iso: string) {
  return iso.slice(0, 7);
}

export function parseMonthKey(key: string) {
  const [y, m] = key.split("-").map(Number);
  return { y, m };
}

export function monthName(m: number) {
  return MONTH_NAMES[m - 1];
}

export function monthShort(m: number) {
  return MONTH_NAMES[m - 1].slice(0, 3);
}

export function daysInMonth(y: number, m: number) {
  return new Date(y, m, 0).getDate();
}

/** 0 = Sunday */
export function weekdayOf(y: number, m: number, d: number) {
  return new Date(y, m - 1, d).getDay();
}

export function firstDayOf(key: string) {
  return `${key}-01`;
}

export function lastDayOf(key: string) {
  const { y, m } = parseMonthKey(key);
  return toISO(y, m, daysInMonth(y, m));
}

export function eventEnd(e: Pick<CalendarEvent, "start" | "end">) {
  return e.end ?? e.start;
}

/** Inclusive day count. */
export function daySpan(e: Pick<CalendarEvent, "start" | "end">) {
  const a = parseISO(e.start);
  const b = parseISO(eventEnd(e));
  return Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86400000) + 1;
}

export function overlapsMonth(e: Pick<CalendarEvent, "start" | "end">, key: string) {
  return e.start <= lastDayOf(key) && eventEnd(e) >= firstDayOf(key);
}

/** Every month key from the first event's month through the last event's month. */
export function monthKeysFor(events: Pick<CalendarEvent, "start" | "end">[]) {
  if (events.length === 0) return [];
  const first = events.reduce((min, e) => (e.start < min ? e.start : min), events[0].start);
  const last = events.reduce((max, e) => (eventEnd(e) > max ? eventEnd(e) : max), eventEnd(events[0]));
  const keys: string[] = [];
  let { y, m } = parseMonthKey(monthKeyOf(first));
  const stop = monthKeyOf(last);
  for (;;) {
    const key = `${y}-${pad(m)}`;
    keys.push(key);
    if (key >= stop) break;
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return keys;
}

function dayLabel(iso: string) {
  const { m, d } = parseISO(iso);
  return `${monthShort(m)} ${d}`;
}

/** "Oct 8–10", "Nov 6 – Dec 20", or just "Dec 5". */
export function formatRange(start: string, end?: string) {
  if (!end || end === start) return dayLabel(start);
  const a = parseISO(start);
  const b = parseISO(end);
  if (a.y === b.y && a.m === b.m) return `${dayLabel(start)}–${b.d}`;
  return `${dayLabel(start)} – ${dayLabel(end)}`;
}

/** Day-of-month numbers an event should appear on in the given month's grid. */
export function gridDaysFor(e: CalendarEvent, key: string): number[] {
  const { y, m } = parseMonthKey(key);
  const monthStart = firstDayOf(key);
  const monthEnd = lastDayOf(key);

  if (daySpan(e) > GRID_MULTIDAY_MAX) {
    return e.start >= monthStart && e.start <= monthEnd ? [parseISO(e.start).d] : [];
  }

  const days: number[] = [];
  for (let d = 1; d <= daysInMonth(y, m); d++) {
    const iso = toISO(y, m, d);
    if (iso >= e.start && iso <= eventEnd(e)) days.push(d);
  }
  return days;
}
