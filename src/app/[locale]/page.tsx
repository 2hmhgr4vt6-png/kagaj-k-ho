import Link from 'next/link'
import { notFound } from 'next/navigation'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { createTranslator } from '@/lib/i18n/dictionary'
import {
  listCategories,
  listLifeEvents,
  listMostSearched,
  listPublishedProcedures,
  listRecentlyVerified,
} from '@/lib/content/queries'
import { SearchBox } from '@/components/SearchBox'
import { ProcedureCardGrid } from '@/components/ProcedureCard'
import { SponsorSlotView } from '@/components/SponsorSlot'

export const revalidate = 300

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale = raw as Locale
  const t = createTranslator(locale)

  const [categories, lifeEvents, popular, mostSearched, recentlyVerified] =
    await Promise.all([
      listCategories(),
      listLifeEvents(),
      listPublishedProcedures({ take: 6 }),
      listMostSearched(6),
      listRecentlyVerified(6),
    ])

  return (
    <div className="space-y-14">
      {/* 1. Hero + search */}
      <section className="rounded-xl2 bg-gradient-to-br from-brand-800 to-brand-950 px-5 py-12 text-white sm:px-10 sm:py-16">
        <h1 className="max-w-3xl text-3xl font-bold leading-snug sm:text-4xl">
          {t('home.headline')}
        </h1>
        <p className="mt-3 max-w-2xl text-brand-100">{t('home.subheadline')}</p>
        <div className="mt-7 max-w-2xl">
          <SearchBox
            locale={locale}
            placeholder={t('home.searchPlaceholder')}
            buttonLabel={t('home.searchButton')}
          />
        </div>
      </section>

      {/* Quick categories */}
      <section aria-labelledby="quick-categories">
        <h2 id="quick-categories" className="mb-4 text-xl font-bold text-ink">
          {t('home.quickCategories')}
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/${locale}/categories/${category.slug}`}
                className="flex h-full flex-col gap-1 rounded-xl2 border border-slate-200
                           bg-white p-4 text-center transition hover:border-brand-300 hover:shadow-sm"
              >
                <span aria-hidden="true" className="text-2xl">
                  {category.icon}
                </span>
                <span className="text-sm font-medium text-ink">
                  {locale === 'ne' ? category.nameNe : category.nameEn}
                </span>
                <span className="text-xs text-ink-faint">
                  {category._count.procedures}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 2. Popular services */}
      <section aria-labelledby="popular">
        <h2 id="popular" className="mb-4 text-xl font-bold text-ink">
          {t('home.popular')}
        </h2>
        <ProcedureCardGrid procedures={popular} locale={locale} t={t} />
      </section>

      <SponsorSlotView placement="home_below_popular" locale={locale} t={t} />

      {/* 3. Most searched */}
      <section aria-labelledby="most-searched">
        <h2 id="most-searched" className="mb-4 text-xl font-bold text-ink">
          {t('home.mostSearched')}
        </h2>
        <ProcedureCardGrid procedures={mostSearched} locale={locale} t={t} />
      </section>

      {/* 4. Recently verified */}
      <section aria-labelledby="recently-verified">
        <h2 id="recently-verified" className="mb-4 text-xl font-bold text-ink">
          {t('home.recentlyVerified')}
        </h2>
        <ProcedureCardGrid procedures={recentlyVerified} locale={locale} t={t} />
      </section>

      {/* 5. Browse by life event */}
      <section aria-labelledby="life-events">
        <h2 id="life-events" className="mb-4 text-xl font-bold text-ink">
          {t('home.browseByLifeEvent')}
        </h2>
        <ul className="flex flex-wrap gap-2">
          {lifeEvents.map((event) => (
            <li key={event.id}>
              <Link
                href={`/${locale}/life-events/${event.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300
                           bg-white px-4 py-2 text-sm font-medium text-ink
                           transition hover:border-brand-400 hover:bg-brand-50"
              >
                <span aria-hidden="true">{event.icon}</span>
                {locale === 'ne' ? event.nameNe : event.nameEn}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 6 + 7. Why trust us / methodology */}
      <section
        aria-labelledby="why-trust"
        className="rounded-xl2 border border-slate-200 bg-white p-6"
      >
        <h2 id="why-trust" className="text-xl font-bold text-ink">
          {t('home.whyTrust')}
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-3">
          <TrustPoint
            dot="🟢"
            title={t('status.verified')}
            body={t('status.verified.help')}
          />
          <TrustPoint
            dot="🟡"
            title={t('status.needsVerification')}
            body={t('status.needsVerification.help')}
          />
          <TrustPoint
            dot="🔴"
            title={t('status.unavailable')}
            body={t('status.unavailable.help')}
          />
        </ul>
        <Link
          href={`/${locale}/methodology`}
          className="mt-6 inline-block font-medium text-brand-700 hover:underline"
        >
          {t('home.methodology')} →
        </Link>
      </section>
    </div>
  )
}

function TrustPoint({ dot, title, body }: { dot: string; title: string; body: string }) {
  return (
    <li className="rounded-xl2 bg-slate-50 p-4">
      <p className="font-semibold text-ink">
        <span aria-hidden="true">{dot}</span> {title}
      </p>
      <p className="mt-1 text-sm text-ink-muted">{body}</p>
    </li>
  )
}
