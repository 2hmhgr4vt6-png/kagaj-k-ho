import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { AppointmentRequirement, ClaimBasis, VerificationStatus } from '@prisma/client'
import { isLocale, pickWithFallback, type Locale } from '@/lib/i18n/config'
import { createTranslator, type Translator } from '@/lib/i18n/dictionary'
import {
  getPublishedProcedure,
  incrementViewCount,
  listPublishedProcedures,
  type ProcedureDetail,
} from '@/lib/content/queries'
import { getTrustBadge, resolveVerificationStatus } from '@/lib/content/trust'
import { formatDualDate } from '@/lib/dates'
import { buildMetadata } from '@/lib/seo/metadata'
import { breadcrumbJsonLd, faqJsonLd, howToJsonLd } from '@/lib/seo/jsonld'
import { canonicalUrl } from '@/lib/seo/metadata'
import { TrustBadge } from '@/components/TrustBadge'
import { BasisTag } from '@/components/BasisTag'
import { SourceList } from '@/components/SourceList'
import { ReportForm } from '@/components/ReportForm'
import { ChecklistActions } from '@/components/ChecklistActions'
import { ProcedureCardGrid } from '@/components/ProcedureCard'
import { JsonLd } from '@/components/JsonLd'
import { SponsorSlotView } from '@/components/SponsorSlot'

export const revalidate = 300

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale: raw, slug } = await params
  if (!isLocale(raw)) return {}
  const locale = raw as Locale
  const procedure = await getPublishedProcedure(slug)
  if (!procedure) return { title: 'Not found', robots: { index: false, follow: false } }

  const title =
    pickWithFallback(locale, procedure.metaTitleNe, procedure.metaTitleEn) ??
    (locale === 'ne' ? procedure.titleNe : procedure.titleEn)
  const description =
    pickWithFallback(locale, procedure.metaDescriptionNe, procedure.metaDescriptionEn) ??
    (locale === 'ne' ? procedure.summaryNe : procedure.summaryEn)

  return buildMetadata({
    locale,
    path: `services/${slug}`,
    title,
    description,
    image: `/${locale}/services/${slug}/opengraph-image`,
  })
}

export default async function ProcedurePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: raw, slug } = await params
  if (!isLocale(raw)) notFound()
  const locale = raw as Locale
  const t = createTranslator(locale)

  const procedure = await getPublishedProcedure(slug)
  if (!procedure) notFound()

  void incrementViewCount(procedure.id)

  const status = resolveVerificationStatus(procedure)
  const badge = getTrustBadge(status, t)
  const related = (
    await listPublishedProcedures({ categorySlug: procedure.category.slug, take: 4 })
  ).filter((item) => item.id !== procedure.id)

  const activeNotices = procedure.notices.filter(
    (notice) => !notice.endsAt || notice.endsAt > new Date(),
  )

  return (
    <article className="space-y-8">
      <StructuredData procedure={procedure} locale={locale} t={t} />

      <Breadcrumbs procedure={procedure} locale={locale} t={t} />

      {/* Header + trust badge */}
      <header className="space-y-4">
        <h1 className="text-3xl font-bold leading-snug text-ink">
          {locale === 'ne' ? procedure.titleNe : procedure.titleEn}
        </h1>
        <p className="text-lg text-ink-muted">
          {locale === 'ne' ? procedure.summaryNe : procedure.summaryEn}
        </p>

        <div className="rounded-xl2 border border-slate-200 bg-white p-4">
          <TrustBadge badge={badge} showHelp />
          <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-muted">
            <div className="flex gap-1">
              <dt className="font-medium">{t('procedure.lastVerified')}:</dt>
              <dd>
                {procedure.lastVerifiedAt
                  ? formatDualDate(procedure.lastVerifiedAt, locale)
                  : t('procedure.notVerified')}
              </dd>
            </div>
            {procedure.nextReviewAt && (
              <div className="flex gap-1">
                <dt className="font-medium">{t('procedure.nextReview')}:</dt>
                <dd>{formatDualDate(procedure.nextReviewAt, locale)}</dd>
              </div>
            )}
          </dl>
        </div>

        {status === VerificationStatus.SOURCE_CONFLICT && (
          <p
            role="alert"
            className="rounded-xl2 border border-red-300 bg-red-50 p-4 font-medium text-red-900"
          >
            {t('status.conflictBanner')}
          </p>
        )}

        {activeNotices.map((notice) => (
          <div
            key={notice.id}
            className={`rounded-xl2 border p-4 ${
              notice.level === 'CRITICAL'
                ? 'border-red-300 bg-red-50 text-red-900'
                : notice.level === 'WARNING'
                  ? 'border-amber-300 bg-amber-50 text-amber-950'
                  : 'border-blue-200 bg-blue-50 text-blue-900'
            }`}
          >
            <p className="font-semibold">
              {locale === 'ne' ? notice.titleNe : notice.titleEn}
            </p>
            <p className="mt-1 text-sm">
              {locale === 'ne' ? notice.bodyNe : notice.bodyEn}
            </p>
          </div>
        ))}
      </header>

      <ChecklistActions
        slug={procedure.slug}
        locale={locale}
        printLabel={t('common.print')}
        downloadLabel={t('procedure.printChecklist')}
      />

      {/* Eligibility */}
      <Section title={t('procedure.eligibility')} id="eligibility">
        <Paragraphs
          text={pickWithFallback(locale, procedure.eligibilityNe, procedure.eligibilityEn)}
          fallback={t('procedure.notVerified')}
        />
      </Section>

      {/* Required documents / checklist */}
      <Section title={t('procedure.documents')} id="documents">
        {procedure.documents.length === 0 ? (
          <p className="text-sm text-ink-muted">{t('procedure.notVerified')}</p>
        ) : (
          <ul className="space-y-2">
            {procedure.documents.map((entry) => {
              const condition = pickWithFallback(
                locale,
                entry.conditionNe,
                entry.conditionEn,
              )
              return (
                <li
                  key={entry.id}
                  className="flex items-start gap-3 rounded-xl2 border border-slate-200 bg-white p-3"
                >
                  <span aria-hidden="true" className="mt-0.5 text-slate-400">
                    ☐
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-ink">
                      {locale === 'ne' ? entry.document.nameNe : entry.document.nameEn}
                    </p>
                    {condition && (
                      <p className="mt-0.5 text-sm text-ink-muted">{condition}</p>
                    )}
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-ink-faint">
                        {entry.isMandatory
                          ? t('procedure.mandatory')
                          : t('procedure.optional')}
                      </span>
                      <BasisTag basis={entry.basis} t={t} />
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Section>

      {/* Steps */}
      <Section title={t('procedure.steps')} id="steps">
        <ol className="space-y-3">
          {procedure.steps.map((step) => (
            <li
              key={step.id}
              className="flex gap-4 rounded-xl2 border border-slate-200 bg-white p-4"
            >
              <span
                aria-hidden="true"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full
                           bg-brand-700 text-sm font-bold text-white"
              >
                {step.order}
              </span>
              <div className="flex-1">
                <p className="font-medium text-ink">
                  {locale === 'ne' ? step.titleNe : step.titleEn}
                </p>
                {pickWithFallback(locale, step.detailNe, step.detailEn) && (
                  <p className="mt-1 text-sm text-ink-muted">
                    {pickWithFallback(locale, step.detailNe, step.detailEn)}
                  </p>
                )}
                {step.actionUrl && (
                  <a
                    href={step.actionUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="mt-2 inline-block break-all text-sm font-medium
                               text-brand-700 underline underline-offset-2"
                  >
                    {step.actionUrl}
                  </a>
                )}
                <div className="mt-2">
                  <BasisTag basis={step.basis} t={t} hideWhenOfficial />
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* Fees */}
      <Section title={t('procedure.fees')} id="fees">
        {procedure.fees.length === 0 ? (
          <p className="text-sm text-ink-muted">{t('fee.notVerified')}</p>
        ) : (
          <ul className="divide-y divide-slate-200 overflow-hidden rounded-xl2 border border-slate-200 bg-white">
            {procedure.fees.map((fee) => (
              <li key={fee.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 p-4">
                <span className="flex-1 font-medium text-ink">
                  {locale === 'ne' ? fee.labelNe : fee.labelEn}
                </span>
                <span className="font-semibold text-ink">
                  {formatFeeAmount(fee, locale, t)}
                </span>
                <BasisTag basis={fee.basis} t={t} />
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Processing time + appointment + where to apply */}
      <div className="grid gap-4 sm:grid-cols-2">
        <InfoCard title={t('procedure.processingTime')}>
          <p className="text-ink-muted">
            {pickWithFallback(locale, procedure.processingTimeNe, procedure.processingTimeEn) ??
              t('procedure.notVerified')}
          </p>
          <div className="mt-2">
            <BasisTag basis={procedure.processingTimeBasis} t={t} />
          </div>
        </InfoCard>

        <InfoCard title={t('procedure.appointment')}>
          <p className="text-ink-muted">
            {t(`appointment.${procedure.appointmentRequirement}`)}
          </p>
          {pickWithFallback(locale, procedure.appointmentNoteNe, procedure.appointmentNoteEn) && (
            <p className="mt-1 text-sm text-ink-muted">
              {pickWithFallback(
                locale,
                procedure.appointmentNoteNe,
                procedure.appointmentNoteEn,
              )}
            </p>
          )}
          {procedure.appointmentUrl &&
            procedure.appointmentRequirement !== AppointmentRequirement.UNKNOWN && (
              <a
                href={procedure.appointmentUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="mt-2 inline-block break-all text-sm font-medium text-brand-700 underline"
              >
                {procedure.appointmentUrl}
              </a>
            )}
        </InfoCard>
      </div>

      <Section title={t('procedure.whereToApply')} id="where">
        <Paragraphs
          text={pickWithFallback(locale, procedure.whereToApplyNe, procedure.whereToApplyEn)}
          fallback={t('procedure.notVerified')}
        />
        {procedure.offices.length > 0 && (
          <ul className="mt-4 space-y-3">
            {procedure.offices.map(({ office, roleEn, roleNe }) => (
              <li key={office.id} className="rounded-xl2 border border-slate-200 bg-white p-4">
                <p className="font-medium text-ink">
                  {locale === 'ne' ? office.nameNe : office.nameEn}
                </p>
                <p className="text-sm text-ink-muted">
                  {locale === 'ne' ? office.organizationNe : office.organizationEn}
                </p>
                {pickWithFallback(locale, roleNe, roleEn) && (
                  <p className="mt-1 text-sm text-ink-faint">
                    {pickWithFallback(locale, roleNe, roleEn)}
                  </p>
                )}
                {pickWithFallback(locale, office.addressNe, office.addressEn) && (
                  <p className="mt-1 text-sm text-ink-muted">
                    {pickWithFallback(locale, office.addressNe, office.addressEn)}
                  </p>
                )}
                <dl className="mt-2 flex flex-wrap gap-x-4 text-sm text-ink-muted">
                  {office.phone && (
                    <div className="flex gap-1">
                      <dt>☎</dt>
                      <dd>{office.phone}</dd>
                    </div>
                  )}
                  {office.email && (
                    <div className="flex gap-1">
                      <dt>✉</dt>
                      <dd>{office.email}</dd>
                    </div>
                  )}
                </dl>
                {office.hours.length > 0 && (
                  <OfficeHours hours={office.hours} locale={locale} />
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Notes / exceptions */}
      {pickWithFallback(locale, procedure.notesNe, procedure.notesEn) && (
        <Section title={t('procedure.notes')} id="notes">
          <Paragraphs
            text={pickWithFallback(locale, procedure.notesNe, procedure.notesEn)}
          />
        </Section>
      )}

      {/* FAQ */}
      {procedure.faqs.length > 0 && (
        <Section title={t('procedure.faq')} id="faq">
          <div className="space-y-2">
            {procedure.faqs.map((faq) => (
              <details
                key={faq.id}
                className="rounded-xl2 border border-slate-200 bg-white p-4"
              >
                <summary className="cursor-pointer font-medium text-ink">
                  {locale === 'ne' ? faq.questionNe : faq.questionEn}
                </summary>
                <p className="mt-2 text-sm text-ink-muted">
                  {locale === 'ne' ? faq.answerNe : faq.answerEn}
                </p>
                <div className="mt-2">
                  <BasisTag basis={faq.basis} t={t} hideWhenOfficial />
                </div>
              </details>
            ))}
          </div>
        </Section>
      )}

      {/* Official sources */}
      <Section title={t('procedure.sources')} id="sources">
        <SourceList
          sources={procedure.sources}
          locale={locale}
          procedureSlug={procedure.slug}
          labels={{
            organization: t('source.organization'),
            checkedAt: t('source.checkedAt'),
            publishedAt: t('source.publishedAt'),
            primary: t('source.primary'),
            secondary: t('source.secondary'),
            none: t('source.none'),
            open: t('procedure.openOfficialSource'),
          }}
        />
      </Section>

      <ReportForm
        procedureSlug={procedure.slug}
        locale={locale}
        labels={{
          trigger: t('report.trigger'),
          title: t('report.title'),
          intro: t('report.intro'),
          reason: t('report.reason'),
          reasonLabels: {
            FEE_CHANGED: t('report.reason.FEE_CHANGED'),
            DOCUMENTS_CHANGED: t('report.reason.DOCUMENTS_CHANGED'),
            OFFICE_CHANGED: t('report.reason.OFFICE_CHANGED'),
            LINK_BROKEN: t('report.reason.LINK_BROKEN'),
            PROCESS_CHANGED: t('report.reason.PROCESS_CHANGED'),
            OTHER: t('report.reason.OTHER'),
          },
          message: t('report.message'),
          email: t('report.email'),
          submit: t('report.submit'),
          submitting: t('report.submitting'),
          success: t('report.success'),
          error: t('report.error'),
          rateLimited: t('report.rateLimited'),
          privacyNote: t('report.privacyNote'),
        }}
      />

      <SponsorSlotView placement="procedure_footer" locale={locale} t={t} />

      {related.length > 0 && (
        <Section title={t('procedure.relatedIn')} id="related">
          <ProcedureCardGrid procedures={related} locale={locale} t={t} />
        </Section>
      )}
    </article>
  )
}

// ---------------------------------------------------------------------------
// Local presentational helpers
// ---------------------------------------------------------------------------

function Section({
  title,
  id,
  children,
}: {
  title: string
  id: string
  children: React.ReactNode
}) {
  return (
    <section aria-labelledby={id} className="space-y-3">
      <h2 id={id} className="text-xl font-bold text-ink">
        {title}
      </h2>
      {children}
    </section>
  )
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl2 border border-slate-200 bg-white p-4">
      <h2 className="mb-2 font-bold text-ink">{title}</h2>
      {children}
    </section>
  )
}

/** Splits stored newline-separated content into paragraphs. */
function Paragraphs({ text, fallback }: { text: string | null; fallback?: string }) {
  if (!text?.trim()) {
    return fallback ? <p className="text-sm text-ink-muted">{fallback}</p> : null
  }
  return (
    <div className="prose-content">
      {text
        .split(/\n{1,}/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, index) => (
          <p key={index}>{line}</p>
        ))}
    </div>
  )
}

function OfficeHours({
  hours,
  locale,
}: {
  hours: Array<{ id: string; dayOfWeek: number; opensAt: string | null; closesAt: string | null; isClosed: boolean }>
  locale: Locale
}) {
  const DAYS_NE = ['आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहिबार', 'शुक्रबार', 'शनिबार']
  const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const names = locale === 'ne' ? DAYS_NE : DAYS_EN

  return (
    <ul className="mt-2 text-sm text-ink-muted">
      {[...hours]
        .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
        .map((hour) => (
          <li key={hour.id} className="flex gap-2">
            <span className="w-24">{names[hour.dayOfWeek]}</span>
            <span>
              {hour.isClosed ? '—' : `${hour.opensAt ?? '?'} – ${hour.closesAt ?? '?'}`}
            </span>
          </li>
        ))}
    </ul>
  )
}

function formatFeeAmount(
  fee: ProcedureDetail['fees'][number],
  locale: Locale,
  t: Translator,
): string {
  if (fee.basis === ClaimBasis.UNKNOWN && fee.amountNpr == null && !fee.amountTextEn) {
    return t('fee.notVerified')
  }
  const text = pickWithFallback(locale, fee.amountTextNe, fee.amountTextEn)
  if (text) return text
  if (fee.amountNpr === 0) return t('fee.free')
  if (fee.amountNpr == null) return t('fee.notVerified')
  return `${t('fee.currency')} ${fee.amountNpr.toLocaleString(locale === 'ne' ? 'ne-NP' : 'en-US')}`
}

function Breadcrumbs({
  procedure,
  locale,
  t,
}: {
  procedure: ProcedureDetail
  locale: Locale
  t: Translator
}) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-ink-faint">
      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <Link href={`/${locale}`} className="hover:underline">
            {t('site.name')}
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link href={`/${locale}/services`} className="hover:underline">
            {t('nav.services')}
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link
            href={`/${locale}/categories/${procedure.category.slug}`}
            className="hover:underline"
          >
            {locale === 'ne' ? procedure.category.nameNe : procedure.category.nameEn}
          </Link>
        </li>
      </ol>
    </nav>
  )
}

function StructuredData({
  procedure,
  locale,
  t,
}: {
  procedure: ProcedureDetail
  locale: Locale
  t: Translator
}) {
  const officialFees = procedure.fees.filter(
    (fee) => fee.basis === ClaimBasis.OFFICIALLY_STATED && fee.amountNpr != null,
  )

  const howTo = howToJsonLd({
    locale,
    slug: procedure.slug,
    name: locale === 'ne' ? procedure.titleNe : procedure.titleEn,
    description: locale === 'ne' ? procedure.summaryNe : procedure.summaryEn,
    steps: procedure.steps.map((step) => ({
      name: locale === 'ne' ? step.titleNe : step.titleEn,
      text: pickWithFallback(locale, step.detailNe, step.detailEn),
      url: step.actionUrl,
    })),
    // Only emit a machine-readable cost when it is officially sourced —
    // never let an estimate leak into a rich result as if it were a fact.
    estimatedCostNpr:
      officialFees.length > 0
        ? officialFees.reduce((sum, fee) => sum + (fee.amountNpr ?? 0), 0)
        : null,
  })

  const faq = faqJsonLd(
    procedure.faqs.map((item) => ({
      question: locale === 'ne' ? item.questionNe : item.questionEn,
      answer: locale === 'ne' ? item.answerNe : item.answerEn,
    })),
  )

  const breadcrumb = breadcrumbJsonLd([
    { name: t('site.name'), url: canonicalUrl(locale) },
    { name: t('nav.services'), url: canonicalUrl(locale, 'services') },
    {
      name: locale === 'ne' ? procedure.category.nameNe : procedure.category.nameEn,
      url: canonicalUrl(locale, `categories/${procedure.category.slug}`),
    },
    {
      name: locale === 'ne' ? procedure.titleNe : procedure.titleEn,
      url: canonicalUrl(locale, `services/${procedure.slug}`),
    },
  ])

  return (
    <>
      <JsonLd data={howTo} />
      <JsonLd data={breadcrumb} />
      {faq && <JsonLd data={faq} />}
    </>
  )
}
