import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { createTranslator } from '@/lib/i18n/dictionary'
import { listLifeEvents } from '@/lib/content/queries'
import { buildMetadata } from '@/lib/seo/metadata'

export const revalidate = 600

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
    path: 'life-events',
    title: `${t('nav.lifeEvents')} — ${t('site.name')}`,
    description: t('home.browseByLifeEvent'),
  })
}

export default async function LifeEventsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale = raw as Locale
  const t = createTranslator(locale)
  const events = await listLifeEvents()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-ink">{t('nav.lifeEvents')}</h1>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {events.map((event) => (
          <li key={event.id}>
            <Link
              href={`/${locale}/life-events/${event.slug}`}
              className="flex flex-col items-center gap-1 rounded-xl2 border border-slate-200
                         bg-white p-5 text-center transition hover:border-brand-300 hover:shadow-sm"
            >
              <span aria-hidden="true" className="text-3xl">
                {event.icon}
              </span>
              <span className="font-medium text-ink">
                {locale === 'ne' ? event.nameNe : event.nameEn}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
