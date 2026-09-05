import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { VerificationStatus } from '@prisma/client'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { createTranslator } from '@/lib/i18n/dictionary'
import { getTrustBadge } from '@/lib/content/trust'
import { TrustLegend } from '@/components/TrustBadge'
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
    path: 'methodology',
    title: `${t('nav.methodology')} — ${t('site.name')}`,
    description:
      locale === 'ne'
        ? 'कागज के हो? ले प्रत्येक जानकारी कसरी आधिकारिक सरकारी स्रोतसँग मिलाएर जाँच गर्छ।'
        : 'How Kagaj K Ho? checks every piece of information against official Nepal government sources.',
  })
}

const CONTENT = {
  ne: {
    heading: 'हाम्रो तथ्य-जाँच विधि',
    intro:
      'कागज के हो? मा प्रकाशित हरेक महत्त्वपूर्ण तथ्य कुनै न कुनै आधिकारिक स्रोतसँग जोडिएको हुन्छ। हामी सम्झनाबाट वा सामाजिक सञ्जालका दाबीबाट सरकारी नियम लेख्दैनौं।',
    hierarchyTitle: 'स्रोतको वरीयता क्रम',
    hierarchy: [
      'नेपाल सरकारको सम्बन्धित मन्त्रालय/विभाग/निकायको आधिकारिक वेबसाइट',
      'नेपाल सरकारको आधिकारिक पोर्टल',
      'नेपाल राजपत्र, ऐन वा नियमावली',
      'सम्बन्धित स्थानीय तह (नगरपालिका/गाउँपालिका/वडा) को आधिकारिक स्रोत',
      'प्राथमिक स्रोत नभएमा मात्र — भरपर्दो द्वितीय स्रोत, स्पष्ट रूपमा “द्वितीय स्रोत” भनी उल्लेख गरेर',
    ],
    workflowTitle: 'प्रकाशन गर्नुअघिको प्रक्रिया',
    workflow: [
      'सम्बन्धित निकायको प्राथमिक आधिकारिक स्रोत खोज्ने।',
      'स्रोतमा लेखिएको कुरासँग हाम्रो विवरण मिलाएर हेर्ने।',
      'ठ्याक्कै त्यही पृष्ठको URL अभिलेख गर्ने।',
      'जाँच गरेको मिति अभिलेख गर्ने।',
      'हरेक दाबीलाई “आधिकारिक रूपमा उल्लेखित”, “निकालिएको”, “अनुमानित” वा “प्रयोगकर्ताले बताएको” भनी छुट्याउने।',
      'पुन: जाँच गर्ने मिति तोक्ने।',
    ],
    rulesTitle: 'हामीले नगर्ने कुरा',
    rules: [
      'प्रमाणित नभएको दस्तुर, कागजात वा समय आफैँ बनाएर लेख्दैनौं। प्रमाणित नभएमा “प्रमाणित छैन — आधिकारिक स्रोत हेर्नुहोस्” भन्छौं।',
      'प्रयोगकर्ताले बताएको कुरालाई आधिकारिक तथ्य जसरी देखाउँदैनौं।',
      'आधिकारिक स्रोतहरूमा फरक-फरक कुरा भेटिएमा एउटा रोजेर लुकाउँदैनौं — दुवै देखाउँछौं।',
      'पुरानो भइसकेको पृष्ठलाई नयाँ जस्तो देखाउँदैनौं; जाँच मिति नाघेपछि चिन्ह आफैँ 🟡 मा झर्छ।',
      'प्रायोजकले कुनै पनि सरकारी आवश्यकता वा दस्तुर परिवर्तन गर्न पाउँदैनन्।',
    ],
    badgesTitle: 'यी चिन्हहरूको अर्थ',
    reportTitle: 'गल्ती भेट्नुभयो?',
    reportBody:
      'हरेक सेवा पृष्ठमा “यो जानकारी गलत/पुरानो छ?” बटन छ। तपाईंको सूचना हाम्रो सम्पादकीय सूचीमा पुग्छ र आधिकारिक स्रोतसँग पुन: मिलाएर हेरिन्छ।',
  },
  en: {
    heading: 'Our fact-check method',
    intro:
      'Every significant fact published on Kagaj K Ho? is tied to an official source. We do not write government rules from memory or from social-media claims.',
    hierarchyTitle: 'Source hierarchy',
    hierarchy: [
      'The official website of the relevant Nepal Government ministry, department or agency',
      'The official Nepal Government portal',
      'The Nepal Gazette, an Act, or a Regulation',
      'The official source of the relevant local government (municipality / rural municipality / ward)',
      'Only when no primary source exists — a reputable secondary source, clearly labelled "secondary source"',
    ],
    workflowTitle: 'What happens before we publish',
    workflow: [
      'Find the primary official source from the responsible agency.',
      'Compare our record line by line against what the source actually says.',
      'Record the exact URL of that page.',
      'Record the date we checked it.',
      'Label every claim as officially stated, derived, estimated, or user-reported.',
      'Set a date by which the record must be re-checked.',
    ],
    rulesTitle: 'What we never do',
    rules: [
      'We never invent a fee, document or processing time. If it is not verified, we say "Not verified — check the official source."',
      'We never present a user report as an official fact.',
      'When official sources disagree, we do not silently pick one — we show that they conflict.',
      'We never let an outdated page look current; the badge degrades to 🟡 automatically once the review date passes.',
      'Sponsors can never change a government requirement or fee.',
    ],
    badgesTitle: 'What these badges mean',
    reportTitle: 'Found a mistake?',
    reportBody:
      'Every service page has an "Is this information wrong or out of date?" button. Your report goes into our editorial queue and is re-checked against the official source.',
  },
} as const

export default async function MethodologyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale = raw as Locale
  const t = createTranslator(locale)
  const copy = CONTENT[locale]

  const badges = [
    VerificationStatus.VERIFIED,
    VerificationStatus.NEEDS_VERIFICATION,
    VerificationStatus.SOURCE_CONFLICT,
    VerificationStatus.UNAVAILABLE,
  ].map((status) => getTrustBadge(status, t))

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-ink">{copy.heading}</h1>
        <p className="mt-2 text-ink-muted">{copy.intro}</p>
      </header>

      <section>
        <h2 className="text-xl font-bold text-ink">{copy.hierarchyTitle}</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-ink-muted">
          {copy.hierarchy.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="text-xl font-bold text-ink">{copy.workflowTitle}</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-ink-muted">
          {copy.workflow.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="text-xl font-bold text-ink">{copy.rulesTitle}</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-ink-muted">
          {copy.rules.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl2 border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-xl font-bold text-ink">{copy.badgesTitle}</h2>
        <TrustLegend badges={badges} />
      </section>

      <section>
        <h2 className="text-xl font-bold text-ink">{copy.reportTitle}</h2>
        <p className="mt-2 text-ink-muted">{copy.reportBody}</p>
      </section>
    </div>
  )
}
