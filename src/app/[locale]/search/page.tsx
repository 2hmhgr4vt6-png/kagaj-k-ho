import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { createTranslator } from '@/lib/i18n/dictionary'
import { searchProcedures } from '@/lib/search/search'
import { recordSearch } from '@/lib/search/record'
import { SearchBox } from '@/components/SearchBox'
import { getTrustBadge, resolveVerificationStatus } from '@/lib/content/trust'
import { TrustBadge } from '@/components/TrustBadge'
import { buildMetadata } from '@/lib/seo/metadata'
import { VerificationStatus } from '@prisma/client'
import Link from 'next/link'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: raw } = await params
  if (!isLocale(raw)) return {}
  const locale = raw as Locale
  const t = createTranslator(locale)
  return buildMetadata({
    locale,
    path: 'search',
    title: `${t('search.title')} — ${t('site.name')}`,
    description: t('home.subheadline'),
    // Search result pages are thin and infinitely variable; keep them out of
    // the index while still letting crawlers follow through to procedures.
    noIndex: true,
  })
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string }>
}) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale = raw as Locale
  const t = createTranslator(locale)

  const { q } = await searchParams
  const query = (q ?? '').trim()
  const results = query ? await searchProcedures(query, { limit: 30 }) : []

  if (query) void recordSearch(query, results.map((hit) => hit.id))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ink">{t('search.title')}</h1>

      <SearchBox
        locale={locale}
        placeholder={t('home.searchPlaceholder')}
        buttonLabel={t('home.searchButton')}
        initialQuery={query}
        autoFocus={!query}
      />

      {!query ? (
        <p className="text-ink-muted">{t('search.emptyQuery')}</p>
      ) : (
        <>
          <p className="text-sm text-ink-muted">
            {t('search.resultsFor')}: <strong className="text-ink">{query}</strong> ·{' '}
            {results.length} {t('search.resultCount')}
          </p>

          {results.length === 0 ? (
            <div className="rounded-xl2 border border-dashed border-slate-300 p-8 text-center">
              <p className="font-medium text-ink">{t('search.noResults')}</p>
              <p className="mt-1 text-sm text-ink-muted">{t('search.noResultsHelp')}</p>
              <Link
                href={`/${locale}/categories`}
                className="mt-4 inline-block font-medium text-brand-700 hover:underline"
              >
                {t('nav.categories')} →
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {results.map((hit) => {
                const badge = getTrustBadge(
                  resolveVerificationStatus({
                    verificationStatus: hit.verificationStatus as VerificationStatus,
                    lastVerifiedAt: hit.lastVerifiedAt,
                    // The search projection omits nextReviewAt; the detail page
                    // applies the full staleness rule.
                    nextReviewAt: null,
                  }),
                  t,
                )
                return (
                  <li key={hit.id}>
                    <Link href={`/${locale}/services/${hit.slug}`} className="card block">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-ink">
                          {locale === 'ne' ? hit.titleNe : hit.titleEn}
                        </h2>
                        <TrustBadge badge={badge} size="sm" />
                      </div>
                      <p className="mt-1 text-sm text-ink-muted">
                        {locale === 'ne' ? hit.summaryNe : hit.summaryEn}
                      </p>
                      <p className="mt-2 text-xs text-ink-faint">
                        {locale === 'ne' ? hit.categoryNameNe : hit.categoryNameEn}
                      </p>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
