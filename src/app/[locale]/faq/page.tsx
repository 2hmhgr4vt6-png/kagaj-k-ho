import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { createTranslator } from '@/lib/i18n/dictionary'
import { prisma } from '@/lib/db/client'
import { buildMetadata } from '@/lib/seo/metadata'
import { faqJsonLd } from '@/lib/seo/jsonld'
import { JsonLd } from '@/components/JsonLd'
import { BasisTag } from '@/components/BasisTag'

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
    path: 'faq',
    title: `${t('nav.faq')} — ${t('site.name')}`,
    description: t('home.subheadline'),
  })
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale = raw as Locale
  const t = createTranslator(locale)

  // Site-wide FAQs only (procedure-scoped ones live on their procedure page).
  const faqs = await prisma.faq.findMany({
    where: { procedureId: null },
    orderBy: { order: 'asc' },
  })

  const pairs = faqs.map((faq) => ({
    question: locale === 'ne' ? faq.questionNe : faq.questionEn,
    answer: locale === 'ne' ? faq.answerNe : faq.answerEn,
  }))

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* FAQPage schema is emitted only because this page really does render
          these exact questions and answers. */}
      {pairs.length > 0 && <JsonLd data={faqJsonLd(pairs)} />}

      <h1 className="text-3xl font-bold text-ink">{t('nav.faq')}</h1>

      {faqs.length === 0 ? (
        <p className="text-ink-muted">{t('home.noContentYet')}</p>
      ) : (
        <div className="space-y-2">
          {faqs.map((faq) => (
            <details key={faq.id} className="rounded-xl2 border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-ink">
                {locale === 'ne' ? faq.questionNe : faq.questionEn}
              </summary>
              <p className="mt-2 text-sm text-ink-muted">
                {locale === 'ne' ? faq.answerNe : faq.answerEn}
              </p>
              {faq.sourceUrl && (
                <a
                  href={faq.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="mt-2 inline-block break-all text-xs text-brand-700 underline"
                >
                  {faq.sourceUrl}
                </a>
              )}
              <div className="mt-2">
                <BasisTag basis={faq.basis} t={t} hideWhenOfficial />
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  )
}
