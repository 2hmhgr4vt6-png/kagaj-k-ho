import { siteUrl } from '@/lib/env'
import type { Locale } from '@/lib/i18n/config'
import { canonicalUrl } from './metadata'

/**
 * Structured data.
 *
 * Two deliberate constraints:
 *  - We emit `Organization`, never `GovernmentOrganization`, and never a
 *    government logo. Kagaj K Ho? must not be mistaken for an official body.
 *  - FAQPage is emitted only when the page genuinely renders Q&A pairs.
 */

export function organizationJsonLd(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: locale === 'ne' ? 'कागज के हो?' : 'Kagaj K Ho?',
    url: siteUrl,
    description:
      locale === 'ne'
        ? 'नेपालका सरकारी सेवाका लागि आवश्यक कागजात र प्रक्रिया बुझाउने स्वतन्त्र सूचना प्लेटफर्म।'
        : 'An independent information platform explaining documents and steps for government services in Nepal.',
    // Explicitly disclaims affiliation in the machine-readable payload too.
    disambiguatingDescription:
      'Independent, non-governmental information platform. Not affiliated with the Government of Nepal.',
  }
}

export function websiteJsonLd(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: locale === 'ne' ? 'कागज के हो?' : 'Kagaj K Ho?',
    url: canonicalUrl(locale),
    inLanguage: locale === 'ne' ? 'ne-NP' : 'en-US',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${canonicalUrl(locale, 'search')}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function howToJsonLd(input: {
  locale: Locale
  slug: string
  name: string
  description: string
  steps: Array<{ name: string; text?: string | null; url?: string | null }>
  estimatedCostNpr?: number | null
  totalTime?: string | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: input.name,
    description: input.description,
    url: canonicalUrl(input.locale, `services/${input.slug}`),
    inLanguage: input.locale === 'ne' ? 'ne-NP' : 'en-US',
    ...(input.estimatedCostNpr != null
      ? {
          estimatedCost: {
            '@type': 'MonetaryAmount',
            currency: 'NPR',
            value: input.estimatedCostNpr,
          },
        }
      : {}),
    step: input.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      ...(step.text ? { text: step.text } : {}),
      ...(step.url ? { url: step.url } : {}),
    })),
  }
}

/** Only call this when the page actually renders these questions and answers. */
export function faqJsonLd(faqs: Array<{ question: string; answer: string }>) {
  if (faqs.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; url: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
