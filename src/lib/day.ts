// Calendar-day helpers. Every daily boundary on Faithful Flames (which devotion
// is "today", when a discussion closes, analytics days) uses Africa/Kampala.
// Kampala is UTC+03:00 all year (no daylight saving), which lets us build exact
// midnight instants without a timezone library.

export const TIMEZONE = 'Africa/Kampala'
const UTC_OFFSET = '+03:00'

const keyFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** YYYY-MM-DD for the given instant, as seen in Kampala. */
export function dayKeyOf(date: Date | string | number): string {
  return keyFormatter.format(new Date(date))
}

/** Today's YYYY-MM-DD in Kampala. */
export function todayKey(now: Date = new Date()): string {
  return dayKeyOf(now)
}

export function isValidDayKey(key: unknown): key is string {
  if (typeof key !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return false
  const d = new Date(`${key}T12:00:00${UTC_OFFSET}`)
  return !Number.isNaN(d.getTime()) && dayKeyOf(d) === key
}

/** The instant a Kampala day starts (00:00 EAT). */
export function startOfDay(key: string): Date {
  return new Date(`${key}T00:00:00${UTC_OFFSET}`)
}

/** The instant a Kampala day ends (= the next day's 00:00 EAT). */
export function endOfDay(key: string): Date {
  return new Date(startOfDay(key).getTime() + 24 * 60 * 60 * 1000)
}

/** Effective day of a devotion: its explicit dayKey, or its publish date for older rows. */
export function devotionDay(d: { dayKey: string | null; publishedAt: Date | string }): string {
  return d.dayKey ?? dayKeyOf(d.publishedAt)
}

/**
 * A devotion's discussion is open only during its own Kampala calendar day.
 * Called by the comment APIs, so the rule holds even if the UI is bypassed.
 */
export function isDiscussionOpen(
  d: { dayKey: string | null; publishedAt: Date | string },
  now: Date = new Date(),
): boolean {
  return devotionDay(d) === todayKey(now)
}

/** "Saturday, 7 November 2026" */
export function formatDay(key: string, opts: Intl.DateTimeFormatOptions = {}): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...opts,
  }).format(new Date(`${key}T12:00:00${UTC_OFFSET}`))
}

export function addDays(key: string, n: number): string {
  return dayKeyOf(new Date(`${key}T12:00:00${UTC_OFFSET}`).getTime() + n * 86_400_000)
}
