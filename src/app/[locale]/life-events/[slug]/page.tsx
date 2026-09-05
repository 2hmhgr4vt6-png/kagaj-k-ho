import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { createTranslator } from '@/lib/i18n/dictionary'
import { getLifeEvent, listPublishedProcedures } from '@/lib/content/queries'
import { ProcedureCardGrid } from '@/components/ProcedureCard'
import { buildMetadata } from '@/lib/seo/metadata'

export const revalidate = 300

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale: raw, slug } = await params
  if (!isLocale(raw)) return {}
  const locale = raw as Locale
  const event = await getLifeEvent(slug)
  if (!event) return { robots: { index: false, follow: false } }
  const t = createTranslator(locale)
  const name = locale === 'ne' ? event.nameNe : event.nameEn

  return buildMetadata({
    locale,
    path: `life-events/${slug}`,
    title: `${name} — ${t('site.name')}`,
    description: t('home.browseByLifeEvent'),
  })
}

export default async function LifeEventPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: raw, slug } = await params
  if (!isLocale(raw)) notFound()
  const locale = raw as Locale
  const t = createTranslator(locale)

  const event = await getLifeEvent(slug)
  if (!event) notFound()
  const procedures = await listPublishedProcedures({ lifeEventSlug: slug })

  return (
    <div className="space-y-6">
      <header>
        <p className="text-3xl" aria-hidden="true">
          {event.icon}
        </p>
        <h1 className="mt-1 text-3xl font-bold text-ink">
          {locale === 'ne' ? event.nameNe : event.nameEn}
        </h1>
      </header>
      <ProcedureCardGrid procedures={procedures} locale={locale} t={t} />
    </div>
  )
}
