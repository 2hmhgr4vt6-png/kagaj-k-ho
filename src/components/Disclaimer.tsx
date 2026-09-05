import type { Translator } from '@/lib/i18n/dictionary'

/**
 * The independence disclaimer. Present on every page — but note that it is
 * never a substitute for fact-checking: the trust badges and per-claim basis
 * tags carry that job.
 */
export function DisclaimerBlock({
  t,
  variant = 'full',
}: {
  t: Translator
  variant?: 'full' | 'short'
}) {
  return (
    <aside
      className="rounded-xl2 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"
      aria-label={t('nav.about')}
    >
      <p>{variant === 'full' ? t('disclaimer.full') : t('disclaimer.short')}</p>
    </aside>
  )
}
