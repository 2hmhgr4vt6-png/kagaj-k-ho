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
    path: 'disclaimer',
    title: `${t('nav.about')} — ${t('site.name')}`,
    description: t('disclaimer.full'),
  })
}

const CONTENT = {
  ne: {
    heading: 'हाम्रोबारे र अस्वीकरण',
    whoTitle: 'हामी को हौं?',
    who: 'कागज के हो? नेपालका सरकारी सेवाहरूका लागि कस्ता कागजात चाहिन्छ र प्रक्रिया कस्तो हुन्छ भन्ने कुरा सजिलो भाषामा बुझाउने स्वतन्त्र सूचना प्लेटफर्म हो।',
    notTitle: 'हामी के होइनौं?',
    not: [
      'हामी सरकारी वेबसाइट होइनौं।',
      'हामी कुनै पनि सरकारी कार्यालयको प्रतिनिधि होइनौं।',
      'हामी कानुनी फर्म वा परामर्शदाता होइनौं।',
      'हामी तपाईंको तर्फबाट कुनै आवेदन दर्ता, स्वीकृत वा प्रक्रिया गर्न सक्दैनौं।',
      'हामी कुनै पनि आवेदनको नतिजा सुनिश्चित गर्न सक्दैनौं।',
    ],
    dataTitle: 'हामी के संकलन गर्दैनौं',
    data: 'हामी तपाईंको नागरिकता, राहदानी वा राष्ट्रिय परिचयपत्र नम्बर माग्दैनौं र भण्डारण गर्दैनौं। कुनै कागजात अपलोड गर्ने सुविधा छैन। कुनै भुक्तानी लिँदैनौं।',
  },
  en: {
    heading: 'About and disclaimer',
    whoTitle: 'Who we are',
    who: 'Kagaj K Ho? is an independent information platform that explains, in plain language, which documents and steps are needed for government services in Nepal.',
    notTitle: 'What we are not',
    not: [
      'We are not a government website.',
      'We do not represent any government office.',
      'We are not a law firm or a consultancy.',
      'We cannot submit, approve or process any application on your behalf.',
      'We cannot guarantee the outcome of any application.',
    ],
    dataTitle: 'What we do not collect',
    data: 'We never ask for or store your citizenship, passport or national ID numbers. There is no document upload. We take no payments.',
  },
} as const

export default async function DisclaimerPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale = raw as Locale
  const t = createTranslator(locale)
  const copy = CONTENT[locale]

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="text-3xl font-bold text-ink">{copy.heading}</h1>

      <p className="rounded-xl2 border border-amber-300 bg-amber-50 p-5 font-medium text-amber-950">
        {t('disclaimer.full')}
      </p>

      <section>
        <h2 className="text-xl font-bold text-ink">{copy.whoTitle}</h2>
        <p className="mt-2 text-ink-muted">{copy.who}</p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-ink">{copy.notTitle}</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-muted">
          {copy.not.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-ink">{copy.dataTitle}</h2>
        <p className="mt-2 text-ink-muted">{copy.data}</p>
      </section>
    </div>
  )
}
