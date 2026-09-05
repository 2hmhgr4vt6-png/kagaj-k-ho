'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Locale } from '@/lib/i18n/config'
import { track } from '@/lib/analytics/track'

type Suggestion = {
  slug: string
  titleEn: string
  titleNe: string
  categoryNameEn: string
  categoryNameNe: string
  verificationStatus: string
}

const DOT: Record<string, string> = {
  VERIFIED: '🟢',
  NEEDS_VERIFICATION: '🟡',
  SOURCE_CONFLICT: '🔴',
  UNAVAILABLE: '🔴',
}

/**
 * Search with keyboard-navigable autocomplete.
 *
 * Implemented as an ARIA combobox so it is usable without a mouse and
 * announced correctly by screen readers — this is the primary entry point of
 * the whole site.
 */
export function SearchBox({
  locale,
  placeholder,
  buttonLabel,
  initialQuery = '',
  autoFocus = false,
}: {
  locale: Locale
  placeholder: string
  buttonLabel: string
  initialQuery?: string
  autoFocus?: boolean
}) {
  const router = useRouter()
  const listId = useId()
  const [query, setQuery] = useState(initialQuery)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setSuggestions([])
      return
    }

    const controller = new AbortController()
    // Debounced so typing in Devanagari (which fires many input events per
    // visible character) does not spam the API.
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}&limit=6`,
          { signal: controller.signal },
        )
        if (!response.ok) return
        const data = (await response.json()) as { results: Suggestion[] }
        setSuggestions(data.results)
        setOpen(data.results.length > 0)
        setActiveIndex(-1)
      } catch {
        // Aborted or offline — leave the previous suggestions in place.
      }
    }, 180)

    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [query])

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  function goToSearch(value: string) {
    const trimmed = value.trim()
    if (!trimmed) return
    track('search', { locale })
    setOpen(false)
    router.push(`/${locale}/search?q=${encodeURIComponent(trimmed)}`)
  }

  function goToProcedure(slug: string) {
    setOpen(false)
    router.push(`/${locale}/services/${slug}`)
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((i) => (i + 1) % suggestions.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      goToProcedure(suggestions[activeIndex]!.slug)
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault()
          goToSearch(query)
        }}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <div className="relative flex-1">
          <label htmlFor={`${listId}-input`} className="sr-only">
            {placeholder}
          </label>
          <input
            id={`${listId}-input`}
            type="search"
            value={query}
            autoFocus={autoFocus}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder={placeholder}
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined
            }
            className="w-full rounded-xl2 border border-slate-300 bg-white px-4 py-3.5 text-base
                       shadow-sm placeholder:text-slate-400 focus:border-brand-500"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl2 bg-brand-700 px-6 py-3.5 font-semibold text-white
                     transition hover:bg-brand-800 active:bg-brand-900"
        >
          {buttonLabel}
        </button>
      </form>

      {open && suggestions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl2 border
                     border-slate-200 bg-white shadow-lg"
        >
          {suggestions.map((suggestion, index) => (
            <li key={suggestion.slug} role="none">
              <button
                type="button"
                id={`${listId}-option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => goToProcedure(suggestion.slug)}
                className={`flex w-full items-center gap-2 px-4 py-3 text-left ${
                  index === activeIndex ? 'bg-brand-50' : 'bg-white'
                }`}
              >
                <span aria-hidden="true">{DOT[suggestion.verificationStatus] ?? '🟡'}</span>
                <span className="flex-1">
                  <span className="block font-medium text-ink">
                    {locale === 'ne' ? suggestion.titleNe : suggestion.titleEn}
                  </span>
                  <span className="block text-xs text-ink-faint">
                    {locale === 'ne'
                      ? suggestion.categoryNameNe
                      : suggestion.categoryNameEn}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
