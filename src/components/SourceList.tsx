'use client'

import { SourceType } from '@prisma/client'
import type { Locale } from '@/lib/i18n/config'
import { formatDualDate } from '@/lib/dates'
import { track } from '@/lib/analytics/track'

export type SourceItem = {
  id: string
  organization: string
  title: string
  url: string
  sourceType: SourceType
  isPrimary: boolean
  publishedAt: Date | null
  checkedAt: Date
  notes: string | null
}

type Labels = {
  organization: string
  checkedAt: string
  publishedAt: string
  primary: string
  secondary: string
  none: string
  open: string
}

/**
 * Official source list. Secondary sources are always visually distinguished —
 * a blog post must never look like a ministry page.
 */
export function SourceList({
  sources,
  locale,
  labels,
  procedureSlug,
}: {
  sources: SourceItem[]
  locale: Locale
  labels: Labels
  procedureSlug: string
}) {
  if (sources.length === 0) {
    return <p className="text-sm text-ink-muted">{labels.none}</p>
  }

  return (
    <ul className="space-y-3">
      {sources.map((source) => {
        const isSecondary = source.sourceType === SourceType.REPUTABLE_SECONDARY
        return (
          <li
            key={source.id}
            className={`rounded-xl2 border p-4 ${
              isSecondary ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded px-1.5 py-0.5 text-[0.7rem] font-medium ring-1 ring-inset ${
                  isSecondary
                    ? 'bg-amber-100 text-amber-900 ring-amber-600/20'
                    : 'bg-green-50 text-green-800 ring-green-600/20'
                }`}
              >
                {isSecondary ? labels.secondary : labels.primary}
              </span>
              <span className="text-sm font-medium text-ink">{source.organization}</span>
            </div>

            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              onClick={() =>
                track('source_click', {
                  slug: procedureSlug,
                  sourceHost: safeHost(source.url),
                  locale,
                })
              }
              className="mt-1 block break-words font-medium text-brand-700 underline
                         underline-offset-2 hover:text-brand-900"
            >
              {source.title}
              <span className="sr-only"> — {labels.open}</span>
            </a>

            <p className="mt-1 break-all text-xs text-ink-faint">{source.url}</p>

            <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-ink-muted">
              <div className="flex gap-1">
                <dt className="font-medium">{labels.checkedAt}:</dt>
                <dd>{formatDualDate(source.checkedAt, locale)}</dd>
              </div>
              {source.publishedAt && (
                <div className="flex gap-1">
                  <dt className="font-medium">{labels.publishedAt}:</dt>
                  <dd>{formatDualDate(source.publishedAt, locale)}</dd>
                </div>
              )}
            </dl>

            {source.notes && <p className="mt-2 text-xs text-ink-muted">{source.notes}</p>}
          </li>
        )
      })}
    </ul>
  )
}

function safeHost(url: string): string | undefined {
  try {
    return new URL(url).host
  } catch {
    return undefined
  }
}
