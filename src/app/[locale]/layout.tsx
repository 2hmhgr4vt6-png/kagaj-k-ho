import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { isLocale, locales, type Locale } from '@/lib/i18n/config'
import { createTranslator } from '@/lib/i18n/dictionary'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { DisclaimerBlock } from '@/components/Disclaimer'
import { JsonLd } from '@/components/JsonLd'
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo/jsonld'
import { buildMetadata } from '@/lib/seo/metadata'
import { siteUrl } from '@/lib/env'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = createTranslator(locale)

  return {
    metadataBase: new URL(siteUrl),
    ...buildMetadata({
      locale,
      title: `${t('site.name')} — ${t('site.tagline')}`,
      description: t('home.subheadline'),
    }),
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale = raw as Locale
  const t = createTranslator(locale)

  return (
    <html lang={locale === 'ne' ? 'ne-NP' : 'en'} dir="ltr">
      <body className="flex min-h-screen flex-col">
        <JsonLd data={organizationJsonLd(locale)} />
        <JsonLd data={websiteJsonLd(locale)} />

        <SiteHeader locale={locale} t={t} />

        <main id="main" className="mx-auto w-full max-w-content flex-1 px-4 py-8">
          {children}
        </main>

        <div className="mx-auto w-full max-w-content px-4 pb-8">
          <DisclaimerBlock t={t} />
        </div>

        <SiteFooter locale={locale} t={t} />
      </body>
    </html>
  )
}
