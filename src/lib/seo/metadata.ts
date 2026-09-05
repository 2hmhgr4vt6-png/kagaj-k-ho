import type { Metadata } from 'next'
import { siteUrl } from '@/lib/env'
import { locales, type Locale } from '@/lib/i18n/config'

export function canonicalUrl(locale: Locale, path = ''): string {
  const clean = path.replace(/^\/+/, '')
  return `${siteUrl}/${locale}${clean ? `/${clean}` : ''}`
}

/** hreflang alternates for every locale of the same page. */
export function localeAlternates(path = ''): Record<string, string> {
  return Object.fromEntries(locales.map((l) => [l, canonicalUrl(l, path)]))
}

export function buildMetadata(input: {
  locale: Locale
  path?: string
  title: string
  description: string
  /** Absolute or site-relative OG image URL. */
  image?: string
  noIndex?: boolean
}): Metadata {
  const url = canonicalUrl(input.locale, input.path)
  const image = input.image
    ? input.image.startsWith('http')
      ? input.image
      : `${siteUrl}${input.image}`
    : undefined

  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: url, languages: localeAlternates(input.path) },
    robots: input.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'article',
      url,
      title: input.title,
      description: input.description,
      siteName: input.locale === 'ne' ? 'कागज के हो?' : 'Kagaj K Ho?',
      locale: input.locale === 'ne' ? 'ne_NP' : 'en_US',
      images: image ? [{ url: image, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
      images: image ? [image] : undefined,
    },
  }
}
