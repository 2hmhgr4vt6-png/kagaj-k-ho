import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { createTranslator } from '@/lib/i18n/dictionary'
import { getCategory, listPublishedProcedures } from '@/lib/content/queries'
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
  const category = await getCategory(slug)
  if (!category) return { robots: { index: false, follow: false } }
  const t = createTranslator(locale)
  const name = locale === 'ne' ? category.nameNe : category.nameEn

  return buildMetadata({
    locale,
    path: `categories/${slug}`,
    title: `${name} — ${t('site.name')}`,
    description:
      (locale === 'ne' ? category.descriptionNe : category.descriptionEn) ??
      t('home.subheadline'),
  })
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: raw, slug } = await params
  if (!isLocale(raw)) notFound()
  const locale = raw as Locale
  const t = createTranslator(locale)

  const category = await getCategory(slug)
  if (!category) notFound()
  const procedures = await listPublishedProcedures({ categorySlug: slug })

  return (
    <div className="space-y-6">
      <header>
        <p className="text-3xl" aria-hidden="true">
          {category.icon}
        </p>
        <h1 className="mt-1 text-3xl font-bold text-ink">
          {locale === 'ne' ? category.nameNe : category.nameEn}
        </h1>
        {(locale === 'ne' ? category.descriptionNe : category.descriptionEn) && (
          <p className="mt-2 text-ink-muted">
            {locale === 'ne' ? category.descriptionNe : category.descriptionEn}
          </p>
        )}
      </header>
      <ProcedureCardGrid procedures={procedures} locale={locale} t={t} />
    </div>
  )
}
