import Link from 'next/link'
import { Suspense } from 'react'
import type { Locale } from '@/lib/i18n/config'
import type { Translator } from '@/lib/i18n/dictionary'
import { LanguageSwitcher } from './LanguageSwitcher'

export function SiteHeader({ locale, t }: { locale: Locale; t: Translator }) {
  const links = [
    { href: `/${locale}/services`, label: t('nav.services') },
    { href: `/${locale}/categories`, label: t('nav.categories') },
    { href: `/${locale}/life-events`, label: t('nav.lifeEvents') },
    { href: `/${locale}/methodology`, label: t('nav.methodology') },
  ]

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3
                   focus:rounded focus:bg-brand-700 focus:px-3 focus:py-2 focus:text-white"
      >
        {t('nav.skipToContent')}
      </a>
      <div className="mx-auto flex max-w-content items-center gap-4 px-4 py-3">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="grid h-8 w-8 place-items-center rounded-lg bg-brand-700 text-sm font-bold text-white"
          >
            कके
          </span>
          <span className="text-lg font-bold tracking-tight text-ink">{t('site.name')}</span>
        </Link>

        <nav aria-label={t('nav.services')} className="ml-auto hidden gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-muted
                         transition hover:bg-slate-100 hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto md:ml-0">
          <Suspense fallback={null}>
            <LanguageSwitcher locale={locale} />
          </Suspense>
        </div>
      </div>

      {/* Mobile nav: horizontally scrollable rather than hidden behind a menu. */}
      <nav
        aria-label={t('nav.services')}
        className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 md:hidden"
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm text-ink-muted hover:bg-slate-100"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
