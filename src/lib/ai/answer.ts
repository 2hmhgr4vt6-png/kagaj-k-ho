import { ClaimBasis } from '@prisma/client'
import type { ProcedureDetail } from '@/lib/content/queries'
import { type Locale, pickWithFallback } from '@/lib/i18n/config'
import { formatDualDate } from '@/lib/dates'
import { resolveVerificationStatus } from '@/lib/content/trust'

export type AiAnswer = {
  /** True only when the answer is grounded in a published, sourced record. */
  grounded: boolean
  answer: string
  procedureSlug: string | null
  verificationStatus: string | null
  lastVerified: string | null
  sources: Array<{ organization: string; title: string; url: string }>
  attribution: string | null
}

const OFFICIAL_PORTAL = 'https://nepal.gov.np/'

/**
 * Builds an answer strictly from stored, source-backed fields.
 *
 * This function is the guardrail the AI feature is built around: it can only
 * ever emit text assembled from database columns and it always returns the
 * source list and verification date alongside. There is no path here through
 * which a model could add a requirement that is not in the record.
 */
export function answerFromVerifiedContent(
  procedure: ProcedureDetail | null,
  locale: Locale,
): AiAnswer {
  if (!procedure) {
    return {
      grounded: false,
      answer:
        locale === 'ne'
          ? 'यो कुरा हामीले नेपाल सरकारको आधिकारिक स्रोतबाट अझै प्रमाणित गर्न सकेका छैनौं। आधिकारिक जानकारीका लागि नेपाल सरकारको पोर्टल हेर्नुहोस्।'
          : "I couldn't verify this from an official Nepal government source yet. Here is the official place to check.",
      procedureSlug: null,
      verificationStatus: null,
      lastVerified: null,
      sources: [{ organization: 'Government of Nepal', title: 'Nepal Government Portal', url: OFFICIAL_PORTAL }],
      attribution: null,
    }
  }

  const status = resolveVerificationStatus(procedure)
  const title = locale === 'ne' ? procedure.titleNe : procedure.titleEn
  const lines: string[] = [title, '']

  lines.push(locale === 'ne' ? procedure.summaryNe : procedure.summaryEn)

  const documents = procedure.documents.filter(
    (entry) => entry.basis === ClaimBasis.OFFICIALLY_STATED,
  )
  if (documents.length > 0) {
    lines.push('', locale === 'ne' ? 'आवश्यक कागजात:' : 'Required documents:')
    for (const entry of documents) {
      const name = locale === 'ne' ? entry.document.nameNe : entry.document.nameEn
      const condition = pickWithFallback(locale, entry.conditionNe, entry.conditionEn)
      lines.push(`- ${name}${condition ? ` (${condition})` : ''}`)
    }
  }

  if (procedure.steps.length > 0) {
    lines.push('', locale === 'ne' ? 'प्रक्रिया:' : 'Steps:')
    for (const step of procedure.steps) {
      lines.push(`${step.order}. ${locale === 'ne' ? step.titleNe : step.titleEn}`)
    }
  }

  const sourcedFees = procedure.fees.filter(
    (fee) => fee.basis === ClaimBasis.OFFICIALLY_STATED,
  )
  if (sourcedFees.length > 0) {
    lines.push('', locale === 'ne' ? 'दस्तुर:' : 'Fees:')
    for (const fee of sourcedFees) {
      const label = locale === 'ne' ? fee.labelNe : fee.labelEn
      const amount =
        pickWithFallback(locale, fee.amountTextNe, fee.amountTextEn) ??
        (fee.amountNpr === 0
          ? locale === 'ne'
            ? 'नि:शुल्क'
            : 'Free'
          : fee.amountNpr != null
            ? `NPR ${fee.amountNpr}`
            : locale === 'ne'
              ? 'प्रमाणित छैन'
              : 'Not verified')
      lines.push(`- ${label}: ${amount}`)
    }
  } else {
    lines.push(
      '',
      locale === 'ne'
        ? 'दस्तुर प्रमाणित छैन — आधिकारिक स्रोत हेर्नुहोस्।'
        : 'Fee not verified — check the official source.',
    )
  }

  const primary = procedure.sources[0]
  const lastVerified = procedure.lastVerifiedAt
    ? formatDualDate(procedure.lastVerifiedAt, locale)
    : null

  const attribution = primary
    ? locale === 'ne'
      ? `आधिकारिक स्रोत: ${primary.organization} — ${primary.url}${
          lastVerified ? ` · अन्तिम जाँच: ${lastVerified}` : ''
        }`
      : `Based on verified information from: ${primary.organization} — ${primary.url}${
          lastVerified ? ` · Last verified: ${lastVerified}` : ''
        }`
    : null

  return {
    grounded: procedure.sources.length > 0,
    answer: lines.join('\n'),
    procedureSlug: procedure.slug,
    verificationStatus: status,
    lastVerified,
    sources: procedure.sources.map((source) => ({
      organization: source.organization,
      title: source.title,
      url: source.url,
    })),
    attribution,
  }
}
