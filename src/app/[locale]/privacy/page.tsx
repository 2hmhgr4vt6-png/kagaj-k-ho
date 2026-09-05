import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { createTranslator } from '@/lib/i18n/dictionary'
import { buildMetadata } from '@/lib/seo/metadata'

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
    path: 'privacy',
    title: `${t('footer.privacy')} — ${t('site.name')}`,
    description:
      locale === 'ne'
        ? 'कागज के हो? ले कुन तथ्यांक संकलन गर्छ र कुन गर्दैन।'
        : 'What Kagaj K Ho? collects, and what it deliberately does not.',
  })
}

const CONTENT = {
  ne: {
    heading: 'गोपनीयता',
    collectTitle: 'हामी के संकलन गर्छौं',
    collect: [
      'बेनामी प्रयोग तथ्यांक: कुन पृष्ठ हेरियो, खोज गरियो कि गरिएन, कुन आधिकारिक लिंक क्लिक भयो, भाषा परिवर्तन भयो कि भएन।',
      '“गलत जानकारी” सूचना पठाउँदा तपाईंले लेख्नुभएको विवरण, र तपाईंले स्वेच्छाले दिनुभएमा मात्र इमेल।',
    ],
    notCollectTitle: 'हामी के संकलन गर्दैनौं',
    notCollect: [
      'नागरिकता, राहदानी वा राष्ट्रिय परिचयपत्र नम्बर।',
      'कुनै पनि कागजातको प्रति वा स्क्यान।',
      'खोज्दा टाइप गर्नुभएको शब्द (हामी कति नतिजा आयो भन्ने मात्र गन्छौं)।',
      'भुक्तानी वा बैंक विवरण।',
    ],
    ipTitle: 'IP ठेगाना',
    ip: 'दुरुपयोग रोक्न फारम पठाउँदा तपाईंको IP ठेगानाको एकतर्फी (irreversible) ह्यास मात्र केही समय राखिन्छ। मूल IP ठेगाना भण्डारण गरिँदैन।',
  },
  en: {
    heading: 'Privacy',
    collectTitle: 'What we collect',
    collect: [
      'Anonymous usage events: which page was viewed, whether a search happened, which official link was clicked, whether the language was switched.',
      'The text you write in an "outdated information" report, and your email only if you choose to give it.',
    ],
    notCollectTitle: 'What we do not collect',
    notCollect: [
      'Citizenship, passport or national ID numbers.',
      'Copies or scans of any document.',
      'The words you type into search (we count how many results came back, not what you asked).',
      'Payment or bank details.',
    ],
    ipTitle: 'IP addresses',
    ip: 'To limit abuse of the report form we keep only a one-way, irreversible hash of your IP address for a short period. The IP address itself is never stored.',
  },
} as const

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale = raw as Locale
  const copy = CONTENT[locale]

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="text-3xl font-bold text-ink">{copy.heading}</h1>

      <section>
        <h2 className="text-xl font-bold text-ink">{copy.collectTitle}</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-muted">
          {copy.collect.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-ink">{copy.notCollectTitle}</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-muted">
          {copy.notCollect.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-ink">{copy.ipTitle}</h2>
        <p className="mt-2 text-ink-muted">{copy.ip}</p>
      </section>
    </div>
  )
}
