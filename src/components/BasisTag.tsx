import { ClaimBasis } from '@prisma/client'
import type { Translator } from '@/lib/i18n/dictionary'

const BASIS_CLASSES: Record<ClaimBasis, string> = {
  OFFICIALLY_STATED: 'bg-green-50 text-green-800 ring-green-600/20',
  DERIVED: 'bg-blue-50 text-blue-800 ring-blue-600/20',
  ESTIMATED: 'bg-amber-50 text-amber-900 ring-amber-600/20',
  USER_REPORTED: 'bg-purple-50 text-purple-800 ring-purple-600/20',
  UNKNOWN: 'bg-slate-100 text-slate-700 ring-slate-500/20',
}

/**
 * Renders where a single claim came from. Shown next to every fee, document and
 * processing time so an officially-stated fact is never visually
 * indistinguishable from an estimate or a user report.
 */
export function BasisTag({
  basis,
  t,
  hideWhenOfficial = false,
}: {
  basis: ClaimBasis
  t: Translator
  /** In lists that are entirely official, the tag is noise on every row. */
  hideWhenOfficial?: boolean
}) {
  if (hideWhenOfficial && basis === ClaimBasis.OFFICIALLY_STATED) return null

  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[0.7rem] font-medium ring-1 ring-inset ${BASIS_CLASSES[basis]}`}
    >
      {t(`basis.${basis}`)}
    </span>
  )
}
