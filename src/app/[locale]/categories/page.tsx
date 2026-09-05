import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { createTranslator } from '@/lib/i18n/dictionary'
import { listCategories } from '@/lib/content/queries'
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
    path: 'categories',
    title: `${t('nav.categories')} — ${t('site.name')}`,
    description: t('home.subheadline'),
  })
}

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale = raw as Locale
  const t = createTranslator(locale)
  const categories = await listCategories()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-ink">{t('nav.categories')}</h1>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <li key={category.id}>
            <Link href={`/${locale}/categories/${category.slug}`} className="card block">
              <p className="text-2xl" aria-hidden="true">
                {category.icon}
              </p>
              <h2 className="mt-1 text-lg font-semibold text-ink">
                {locale === 'ne' ? category.nameNe : category.nameEn}
              </h2>
              {(locale === 'ne' ? category.descriptionNe : category.descriptionEn) && (
                <p className="mt-1 text-sm text-ink-muted">
                  {locale === 'ne' ? category.descriptionNe : category.descriptionEn}
                </p>
              )}
              <p className="mt-2 text-xs text-ink-faint">
                {category._count.procedures} · {t('nav.services')}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
