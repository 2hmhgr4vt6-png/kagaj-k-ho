import { VerificationStatus } from '@prisma/client'
import { isReviewOverdue } from '@/lib/dates'
import type { Translator } from '@/lib/i18n/dictionary'

export type TrustTone = 'verified' | 'pending' | 'unavailable'

export type TrustBadge = {
  status: VerificationStatus
  tone: TrustTone
  dot: '🟢' | '🟡' | '🔴'
  label: string
  help: string
}

/**
 * Resolves the badge actually shown to the user.
 *
 * Critical rule: a VERIFIED record whose review date has passed degrades to
 * NEEDS_VERIFICATION. Content must never *look* current just because someone
 * once verified it — staleness is a fact about the page, not an oversight.
 */
export function resolveVerificationStatus(input: {
  verificationStatus: VerificationStatus
  nextReviewAt: Date | null
  lastVerifiedAt: Date | null
  now?: Date
}): VerificationStatus {
  const { verificationStatus, nextReviewAt, lastVerifiedAt, now } = input

  if (verificationStatus === VerificationStatus.SOURCE_CONFLICT) return verificationStatus
  if (verificationStatus === VerificationStatus.UNAVAILABLE) return verificationStatus

  if (verificationStatus === VerificationStatus.VERIFIED) {
    if (!lastVerifiedAt) return VerificationStatus.NEEDS_VERIFICATION
    if (isReviewOverdue(nextReviewAt, now)) return VerificationStatus.NEEDS_VERIFICATION
    return VerificationStatus.VERIFIED
  }

  return VerificationStatus.NEEDS_VERIFICATION
}

export function getTrustBadge(status: VerificationStatus, t: Translator): TrustBadge {
  switch (status) {
    case VerificationStatus.VERIFIED:
      return {
        status,
        tone: 'verified',
        dot: '🟢',
        label: t('status.verified'),
        help: t('status.verified.help'),
      }
    case VerificationStatus.NEEDS_VERIFICATION:
      return {
        status,
        tone: 'pending',
        dot: '🟡',
        label: t('status.needsVerification'),
        help: t('status.needsVerification.help'),
      }
    case VerificationStatus.SOURCE_CONFLICT:
      return {
        status,
        tone: 'unavailable',
        dot: '🔴',
        label: t('status.conflict'),
        help: t('status.conflict.help'),
      }
    case VerificationStatus.UNAVAILABLE:
    default:
      return {
        status: VerificationStatus.UNAVAILABLE,
        tone: 'unavailable',
        dot: '🔴',
        label: t('status.unavailable'),
        help: t('status.unavailable.help'),
      }
  }
}
