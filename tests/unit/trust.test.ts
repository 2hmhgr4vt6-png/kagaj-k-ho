import { describe, expect, it } from 'vitest'
import { VerificationStatus } from '@prisma/client'
import { getTrustBadge, resolveVerificationStatus } from '@/lib/content/trust'
import { createTranslator } from '@/lib/i18n/dictionary'

const now = new Date('2026-09-05T00:00:00Z')
const past = new Date('2026-08-01T00:00:00Z')
const future = new Date('2026-12-01T00:00:00Z')

describe('resolveVerificationStatus', () => {
  it('keeps VERIFIED while the review date is in the future', () => {
    expect(
      resolveVerificationStatus({
        verificationStatus: VerificationStatus.VERIFIED,
        lastVerifiedAt: past,
        nextReviewAt: future,
        now,
      }),
    ).toBe(VerificationStatus.VERIFIED)
  })

  it('degrades VERIFIED to NEEDS_VERIFICATION once the review date passes', () => {
    // This is the rule that stops stale content from looking current.
    expect(
      resolveVerificationStatus({
        verificationStatus: VerificationStatus.VERIFIED,
        lastVerifiedAt: past,
        nextReviewAt: past,
        now,
      }),
    ).toBe(VerificationStatus.NEEDS_VERIFICATION)
  })

  it('never shows VERIFIED without a verification date', () => {
    expect(
      resolveVerificationStatus({
        verificationStatus: VerificationStatus.VERIFIED,
        lastVerifiedAt: null,
        nextReviewAt: future,
        now,
      }),
    ).toBe(VerificationStatus.NEEDS_VERIFICATION)
  })

  it('preserves SOURCE_CONFLICT regardless of dates', () => {
    expect(
      resolveVerificationStatus({
        verificationStatus: VerificationStatus.SOURCE_CONFLICT,
        lastVerifiedAt: past,
        nextReviewAt: future,
        now,
      }),
    ).toBe(VerificationStatus.SOURCE_CONFLICT)
  })

  it('preserves UNAVAILABLE regardless of dates', () => {
    expect(
      resolveVerificationStatus({
        verificationStatus: VerificationStatus.UNAVAILABLE,
        lastVerifiedAt: past,
        nextReviewAt: future,
        now,
      }),
    ).toBe(VerificationStatus.UNAVAILABLE)
  })
})

describe('getTrustBadge', () => {
  const t = createTranslator('en')

  it('maps each status to the documented dot colour', () => {
    expect(getTrustBadge(VerificationStatus.VERIFIED, t).dot).toBe('🟢')
    expect(getTrustBadge(VerificationStatus.NEEDS_VERIFICATION, t).dot).toBe('🟡')
    expect(getTrustBadge(VerificationStatus.SOURCE_CONFLICT, t).dot).toBe('🔴')
    expect(getTrustBadge(VerificationStatus.UNAVAILABLE, t).dot).toBe('🔴')
  })

  it('always carries an explanation of what the badge means', () => {
    for (const status of Object.values(VerificationStatus)) {
      expect(getTrustBadge(status, t).help.length).toBeGreaterThan(20)
    }
  })

  it('uses the conflict wording required by the product spec', () => {
    expect(getTrustBadge(VerificationStatus.SOURCE_CONFLICT, t).help).toContain(
      'Official sources currently show different information',
    )
  })
})
