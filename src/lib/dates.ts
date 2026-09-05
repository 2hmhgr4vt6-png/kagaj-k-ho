import NepaliDate from 'nepali-date-converter'
import type { Locale } from './i18n/config'

/**
 * All timestamps are stored in UTC by Postgres. Everything user-facing is
 * rendered in Asia/Kathmandu (UTC+05:45), because "last verified" dates only
 * make sense against the Nepali working day.
 */
export const KATHMANDU_TZ = 'Asia/Kathmandu'

const NEPALI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९']

export function toNepaliDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => NEPALI_DIGITS[Number(d)])
}

/** Gregorian date in Kathmandu time, e.g. "5 September 2026". */
export function formatGregorian(date: Date, locale: Locale): string {
  const formatted = new Intl.DateTimeFormat('en-GB', {
    timeZone: KATHMANDU_TZ,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
  return locale === 'ne' ? toNepaliDigits(formatted) : formatted
}

/**
 * Bikram Sambat date, e.g. "२०८३ भाद्र १९" (ne) or "2083 Bhadra 19" (en).
 *
 * The converter works on calendar days, so we first shift the instant into
 * Kathmandu local time — otherwise a UTC evening timestamp would convert to
 * the previous BS day.
 */
export function formatBikramSambat(date: Date, locale: Locale): string {
  const local = toKathmanduWallClock(date)
  const nepaliDate = new NepaliDate(local)
  return nepaliDate.format('YYYY MMMM DD', locale === 'ne' ? 'np' : 'en')
}

/**
 * Both calendars together — the format used for "last verified" everywhere:
 * "२०८३ भाद्र १९ (5 September 2026)".
 */
export function formatDualDate(date: Date, locale: Locale): string {
  return `${formatBikramSambat(date, locale)} (${formatGregorian(date, locale)})`
}

/** ISO date (YYYY-MM-DD) in Kathmandu time — used for <time dateTime> and sitemaps. */
export function toIsoDate(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: KATHMANDU_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

/**
 * Returns a Date whose *UTC* fields hold Kathmandu wall-clock values. Only for
 * feeding calendar-day libraries; never store or serialize the result.
 */
function toKathmanduWallClock(date: Date): Date {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: KATHMANDU_TZ,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  return new Date(get('year'), get('month') - 1, get('day'))
}

/** True when a scheduled review date has passed. Drives badge degradation. */
export function isReviewOverdue(nextReviewAt: Date | null | undefined, now = new Date()): boolean {
  if (!nextReviewAt) return false
  return nextReviewAt.getTime() < now.getTime()
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}
