import { ImageResponse } from 'next/og'
import { VerificationStatus } from '@prisma/client'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { getPublishedProcedure } from '@/lib/content/queries'
import { resolveVerificationStatus } from '@/lib/content/trust'
import { formatDualDate } from '@/lib/dates'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const runtime = 'nodejs'

/**
 * Social share card.
 *
 * Deliberately carries no government emblem, flag or seal, and says
 * "Independent — not a government website" so a shared card can never be
 * mistaken for an official announcement.
 */
export default async function OpengraphImage({
  params,
}: {
  params: { locale: string; slug: string }
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : 'ne'
  const procedure = await getPublishedProcedure(params.slug)

  const title = procedure
    ? locale === 'ne'
      ? procedure.titleNe
      : procedure.titleEn
    : locale === 'ne'
      ? 'कागज के हो?'
      : 'Kagaj K Ho?'

  const status = procedure
    ? resolveVerificationStatus(procedure)
    : VerificationStatus.NEEDS_VERIFICATION
  const verified = status === VerificationStatus.VERIFIED

  const updated = procedure?.lastVerifiedAt
    ? formatDualDate(procedure.lastVerifiedAt, locale)
    : null

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)',
          color: 'white',
          padding: 64,
          fontSize: 32,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: 14,
              background: '#4f46e5',
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            कके
          </div>
          <div style={{ fontSize: 30, fontWeight: 700 }}>
            {locale === 'ne' ? 'कागज के हो?' : 'Kagaj K Ho?'}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ fontSize: 62, fontWeight: 700, lineHeight: 1.2 }}>{title}</div>
          {updated && (
            <div style={{ fontSize: 28, color: '#c7d2fe' }}>
              {locale === 'ne' ? 'अन्तिम जाँच' : 'Updated'}: {updated}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: verified ? '#166534' : '#92400e',
              padding: '10px 22px',
              borderRadius: 999,
              fontSize: 26,
            }}
          >
            {verified
              ? locale === 'ne'
                ? '🟢 आधिकारिक स्रोत उपलब्ध'
                : '🟢 Official source available'
              : locale === 'ne'
                ? '🟡 पुन: जाँच आवश्यक'
                : '🟡 Needs verification'}
          </div>
          <div style={{ fontSize: 22, color: '#a5b4fc' }}>
            {locale === 'ne'
              ? 'स्वतन्त्र — सरकारी वेबसाइट होइन'
              : 'Independent — not a government website'}
          </div>
        </div>
      </div>
    ),
    size,
  )
}
