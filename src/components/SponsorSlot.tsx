import { prisma } from '@/lib/db/client'
import type { Locale } from '@/lib/i18n/config'
import type { Translator } from '@/lib/i18n/dictionary'

/**
 * Monetization placement.
 *
 * Structurally isolated from procedure content: this component reads only the
 * SponsorSlot table and can never render a fee, document or step. It also
 * always carries a visible "प्रायोजित / Sponsored" label and `rel="sponsored"`.
 * Nothing here is enabled by default in the MVP.
 */
export async function SponsorSlotView({
  placement,
  locale,
  t,
}: {
  placement: string
  locale: Locale
  t: Translator
}) {
  const now = new Date()
  const slot = await prisma.sponsorSlot.findFirst({
    where: {
      placement,
      isActive: true,
      OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
    },
  })

  if (!slot) return null

  return (
    <aside
      aria-label={t('common.sponsored')}
      lang={locale}
      className="rounded-xl2 border border-dashed border-slate-300 bg-slate-50 p-4"
    >
      <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-wide text-ink-faint">
        {t('common.sponsored')}
      </p>
      <a
        href={slot.targetUrl}
        target="_blank"
        rel="noopener noreferrer sponsored nofollow"
        className="font-medium text-brand-700 hover:underline"
      >
        {slot.headline}
      </a>
      {slot.body && <p className="mt-1 text-sm text-ink-muted">{slot.body}</p>}
    </aside>
  )
}
