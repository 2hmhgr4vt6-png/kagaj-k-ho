export const locales = ['ne', 'en'] as const
export type Locale = (typeof locales)[number]

/** Nepali is the default: this is a Nepali-first product. */
export const defaultLocale: Locale = 'ne'

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

export const localeNames: Record<Locale, string> = {
  ne: 'नेपाली',
  en: 'English',
}

/** Picks the `*Ne` or `*En` variant of a bilingual pair of DB columns. */
export function pick<T>(locale: Locale, ne: T, en: T): T {
  return locale === 'ne' ? ne : en
}

/**
 * Picks the localized value, falling back to the other language when the
 * preferred one is empty. Returning the other language is better than showing
 * a blank field, but callers that render legal/official wording should use
 * `pick` so a missing Nepali term never gets silently replaced by English.
 */
export function pickWithFallback(
  locale: Locale,
  ne: string | null | undefined,
  en: string | null | undefined,
): string | null {
  const preferred = locale === 'ne' ? ne : en
  const other = locale === 'ne' ? en : ne
  return preferred?.trim() ? preferred : other?.trim() ? other : null
}
