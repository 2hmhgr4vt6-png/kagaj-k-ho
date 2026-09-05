import Link from 'next/link'
import type { ProcedureCard as ProcedureCardModel } from '@/lib/content/queries'
import type { Locale } from '@/lib/i18n/config'
import type { Translator } from '@/lib/i18n/dictionary'
import { getTrustBadge, resolveVerificationStatus } from '@/lib/content/trust'
import { formatDualDate } from '@/lib/dates'
import { TrustBadge } from './TrustBadge'

export function ProcedureCardLink({
  procedure,
  locale,
  t,
}: {
  procedure: ProcedureCardModel
  locale: Locale
  t: Translator
}) {
  const status = resolveVerificationStatus(procedure)
  const badge = getTrustBadge(status, t)

  return (
    <Link
      href={`/${locale}/services/${procedure.slug}`}
      className="card flex flex-col gap-2"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-ink">
          {locale === 'ne' ? procedure.titleNe : procedure.titleEn}
        </h3>
        <span aria-hidden="true" className="text-xl">
          {procedure.category.icon}
        </span>
      </div>
      <p className="line-clamp-3 text-sm text-ink-muted">
        {locale === 'ne' ? procedure.summaryNe : procedure.summaryEn}
      </p>
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
        <TrustBadge badge={badge} size="sm" />
        {procedure.lastVerifiedAt && (
          <span className="text-xs text-ink-faint">
            {t('procedure.lastVerified')}: {formatDualDate(procedure.lastVerifiedAt, locale)}
          </span>
        )}
      </div>
    </Link>
  )
}

export function ProcedureCardGrid({
  procedures,
  locale,
  t,
  emptyMessage,
}: {
  procedures: ProcedureCardModel[]
  locale: Locale
  t: Translator
  emptyMessage?: string
}) {
  if (procedures.length === 0) {
    return (
      <p className="rounded-xl2 border border-dashed border-slate-300 p-6 text-center text-sm text-ink-faint">
        {emptyMessage ?? t('home.noContentYet')}
      </p>
    )
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {procedures.map((procedure) => (
        <li key={procedure.id} className="flex">
          <ProcedureCardLink procedure={procedure} locale={locale} t={t} />
        </li>
      ))}
    </ul>
  )
}
