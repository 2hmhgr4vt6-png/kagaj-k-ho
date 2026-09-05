import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import type { Translator } from '@/lib/i18n/dictionary'

export function SiteFooter({ locale, t }: { locale: Locale; t: Translator }) {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-content px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="text-base font-bold text-ink">{t('site.name')}</p>
            <p className="mt-1 text-sm text-ink-muted">{t('site.tagline')}</p>
          </div>

          <nav aria-label={t('nav.about')} className="text-sm">
            <ul className="space-y-2">
              <li>
                <Link href={`/${locale}/methodology`} className="text-brand-700 hover:underline">
                  {t('nav.methodology')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/disclaimer`} className="text-brand-700 hover:underline">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/faq`} className="text-brand-700 hover:underline">
                  {t('nav.faq')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/privacy`} className="text-brand-700 hover:underline">
                  {t('footer.privacy')}
                </Link>
              </li>
            </ul>
          </nav>

          <div className="text-sm text-ink-muted">
            <p>{t('disclaimer.short')}</p>
          </div>
        </div>

        <p className="mt-8 border-t border-slate-100 pt-6 text-xs text-ink-faint">
          {t('footer.rights')}
        </p>
      </div>
    </footer>
  )
}
