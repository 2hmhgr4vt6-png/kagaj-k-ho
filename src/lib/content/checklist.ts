import { ClaimBasis } from '@prisma/client'
import type { Locale } from '@/lib/i18n/config'
import { pickWithFallback } from '@/lib/i18n/config'
import { formatDualDate } from '@/lib/dates'
import { createTranslator } from '@/lib/i18n/dictionary'

export type ChecklistInput = {
  slug: string
  titleEn: string
  titleNe: string
  lastVerifiedAt: Date | null
  documents: Array<{
    isMandatory: boolean
    basis: ClaimBasis
    conditionEn: string | null
    conditionNe: string | null
    document: { nameEn: string; nameNe: string }
  }>
  steps: Array<{ order: number; titleEn: string; titleNe: string }>
  sources: Array<{ title: string; organization: string; url: string }>
}

/**
 * Renders a plain-text checklist for download/print.
 *
 * Every line carries its provenance, and unverified items are explicitly
 * labelled — a printed checklist leaves the site, so it has to be self-evident
 * on paper which items are official and which are not.
 */
export function buildChecklistText(
  procedure: ChecklistInput,
  locale: Locale,
  siteUrl: string,
): string {
  const t = createTranslator(locale)
  const title = locale === 'ne' ? procedure.titleNe : procedure.titleEn
  const lines: string[] = []

  lines.push(t('site.name'))
  lines.push(title)
  lines.push('='.repeat(Math.max(title.length, 20)))
  lines.push('')

  lines.push(`${t('procedure.lastVerified')}: ${
    procedure.lastVerifiedAt
      ? formatDualDate(procedure.lastVerifiedAt, locale)
      : t('procedure.notVerified')
  }`)
  lines.push('')

  lines.push(`## ${t('procedure.documents')}`)
  if (procedure.documents.length === 0) {
    lines.push(`- ${t('procedure.notVerified')}`)
  }
  for (const entry of procedure.documents) {
    const name = locale === 'ne' ? entry.document.nameNe : entry.document.nameEn
    const condition = pickWithFallback(locale, entry.conditionNe, entry.conditionEn)
    const tags = [
      entry.isMandatory ? t('procedure.mandatory') : t('procedure.optional'),
      entry.basis !== ClaimBasis.OFFICIALLY_STATED ? t(`basis.${entry.basis}`) : null,
    ].filter(Boolean)
    lines.push(`[ ] ${name}${condition ? ` — ${condition}` : ''} (${tags.join(', ')})`)
  }
  lines.push('')

  lines.push(`## ${t('procedure.steps')}`)
  for (const step of procedure.steps) {
    lines.push(`${step.order}. ${locale === 'ne' ? step.titleNe : step.titleEn}`)
  }
  lines.push('')

  lines.push(`## ${t('procedure.sources')}`)
  for (const source of procedure.sources) {
    lines.push(`- ${source.organization} — ${source.title}`)
    lines.push(`  ${source.url}`)
  }
  lines.push('')

  lines.push('---')
  lines.push(t('disclaimer.full'))
  lines.push(`${siteUrl}/${locale}/services/${procedure.slug}`)

  return lines.join('\n')
}
