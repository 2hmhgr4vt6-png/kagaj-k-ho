import { describe, expect, it } from 'vitest'
import {
  addDays,
  formatBikramSambat,
  formatDualDate,
  formatGregorian,
  isReviewOverdue,
  toIsoDate,
  toNepaliDigits,
} from '@/lib/dates'

describe('toNepaliDigits', () => {
  it('converts Latin digits to Devanagari digits', () => {
    expect(toNepaliDigits('2083')).toBe('२०८३')
    expect(toNepaliDigits(19)).toBe('१९')
  })

  it('leaves non-digits alone', () => {
    expect(toNepaliDigits('5 September 2026')).toBe('५ September २०२६')
  })
})

describe('Bikram Sambat conversion', () => {
  // 5 September 2026 is 20 Bhadra 2083 BS. (Cross-checked against known
  // anchors: 2000-01-01 = 2056 Poush 17, 2020-04-13 = 2077 Baisakh 1.)
  const date = new Date('2026-09-05T06:00:00Z')

  it('renders BS in Nepali', () => {
    expect(formatBikramSambat(date, 'ne')).toBe('२०८३ भाद्र २०')
  })

  it('renders BS in English', () => {
    expect(formatBikramSambat(date, 'en')).toBe('2083 Bhadra 20')
  })

  it('uses the Kathmandu calendar day, not the UTC day', () => {
    // 20:30 UTC is already the next day (02:15) in Kathmandu (UTC+05:45).
    const lateUtc = new Date('2026-09-05T20:30:00Z')
    expect(formatBikramSambat(lateUtc, 'en')).toBe('2083 Bhadra 21')
  })
})

describe('formatGregorian', () => {
  const date = new Date('2026-09-05T06:00:00Z')

  it('renders a readable English date', () => {
    expect(formatGregorian(date, 'en')).toBe('5 September 2026')
  })

  it('uses Nepali digits in Nepali', () => {
    expect(formatGregorian(date, 'ne')).toBe('५ September २०२६')
  })
})

describe('formatDualDate', () => {
  it('shows both calendars', () => {
    const date = new Date('2026-09-05T06:00:00Z')
    expect(formatDualDate(date, 'en')).toBe('2083 Bhadra 20 (5 September 2026)')
  })
})

describe('toIsoDate', () => {
  it('returns the Kathmandu calendar day in ISO form', () => {
    expect(toIsoDate(new Date('2026-09-05T20:30:00Z'))).toBe('2026-09-06')
  })
})

describe('isReviewOverdue', () => {
  const now = new Date('2026-09-05T00:00:00Z')

  it('is true once the review date has passed', () => {
    expect(isReviewOverdue(new Date('2026-09-04T00:00:00Z'), now)).toBe(true)
  })

  it('is false while the review date is in the future', () => {
    expect(isReviewOverdue(new Date('2026-12-04T00:00:00Z'), now)).toBe(false)
  })

  it('treats a missing review date as not overdue', () => {
    expect(isReviewOverdue(null, now)).toBe(false)
  })
})

describe('addDays', () => {
  it('adds whole days', () => {
    expect(toIsoDate(addDays(new Date('2026-09-05T06:00:00Z'), 90))).toBe('2026-12-04')
  })
})
