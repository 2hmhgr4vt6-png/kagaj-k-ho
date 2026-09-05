'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { locales, localeNames, type Locale } from '@/lib/i18n/config'
import { track } from '@/lib/analytics/track'

/**
 * Swaps the leading locale segment while keeping the rest of the path and the
 * query string, so switching language never loses the page you were on.
 */
export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname() ?? `/${locale}`
  const searchParams = useSearchParams()
  const query = searchParams?.toString()

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Language">
      {locales.map((target) => {
        const segments = pathname.split('/')
        segments[1] = target
        const href = `${segments.join('/')}${query ? `?${query}` : ''}`
        const isActive = target === locale

        return (
          <Link
            key={target}
            href={href}
            hrefLang={target}
            aria-current={isActive ? 'true' : undefined}
            onClick={() => !isActive && track('language_change', { locale: target })}
            className={`rounded-lg px-2.5 py-1 text-sm font-medium transition ${
              isActive
                ? 'bg-brand-700 text-white'
                : 'text-ink-muted hover:bg-slate-100 hover:text-ink'
            }`}
          >
            {localeNames[target]}
          </Link>
        )
      })}
    </div>
  )
}
