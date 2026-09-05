import type { MetadataRoute } from 'next'
import { ContentStatus } from '@prisma/client'
import { prisma } from '@/lib/db/client'
import { locales } from '@/lib/i18n/config'
import { siteUrl } from '@/lib/env'

export const revalidate = 3600

const STATIC_PATHS = ['', 'services', 'categories', 'life-events', 'methodology', 'faq', 'disclaimer', 'privacy']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [procedures, categories, lifeEvents] = await Promise.all([
    prisma.procedure.findMany({
      where: { status: ContentStatus.PUBLISHED },
      select: { slug: true, updatedAt: true, lastVerifiedAt: true },
    }),
    prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.lifeEvent.findMany({ select: { slug: true } }),
  ])

  const entries: MetadataRoute.Sitemap = []

  for (const locale of locales) {
    for (const path of STATIC_PATHS) {
      entries.push({
        url: `${siteUrl}/${locale}${path ? `/${path}` : ''}`,
        changeFrequency: path === '' ? 'daily' : 'weekly',
        priority: path === '' ? 1 : 0.6,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${siteUrl}/${l}${path ? `/${path}` : ''}`]),
          ),
        },
      })
    }

    for (const procedure of procedures) {
      entries.push({
        url: `${siteUrl}/${locale}/services/${procedure.slug}`,
        lastModified: procedure.lastVerifiedAt ?? procedure.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.9,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${siteUrl}/${l}/services/${procedure.slug}`]),
          ),
        },
      })
    }

    for (const category of categories) {
      entries.push({
        url: `${siteUrl}/${locale}/categories/${category.slug}`,
        lastModified: category.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }

    for (const event of lifeEvents) {
      entries.push({
        url: `${siteUrl}/${locale}/life-events/${event.slug}`,
        changeFrequency: 'monthly',
        priority: 0.5,
      })
    }
  }

  return entries
}
