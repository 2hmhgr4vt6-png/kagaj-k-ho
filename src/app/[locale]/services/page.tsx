import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { createTranslator } from '@/lib/i18n/dictionary'
import { listPublishedProcedures } from '@/lib/content/queries'
import { ProcedureCardGrid } from '@/components/ProcedureCard'
import { buildMetadata } from '@/lib/seo/metadata'

export const revalidate = 300

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
    path: 'services',
    title: `${t('nav.services')} — ${t('site.name')}`,
    description: t('home.subheadline'),
  })
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale = raw as Locale
  const t = createTranslator(locale)
  const procedures = await listPublishedProcedures()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-ink">{t('nav.services')}</h1>
      <ProcedureCardGrid procedures={procedures} locale={locale} t={t} />
    </div>
  )
}
