'use client'

import type { Locale } from '@/lib/i18n/config'
import { track } from '@/lib/analytics/track'

/**
 * Print and download. The download is a plain .txt checklist generated
 * server-side so it works offline, prints cleanly and stays readable on any
 * device — no PDF toolchain in the critical path.
 */
export function ChecklistActions({
  slug,
  locale,
  printLabel,
  downloadLabel,
}: {
  slug: string
  locale: Locale
  printLabel: string
  downloadLabel: string
}) {
  return (
    <div className="no-print flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm
                   font-medium text-ink transition hover:bg-slate-50"
      >
        {printLabel}
      </button>
      <a
        href={`/api/checklist/${slug}?locale=${locale}`}
        download
        onClick={() => track('checklist_download', { slug, locale })}
        className="rounded-lg border border-brand-300 bg-brand-50 px-4 py-2 text-sm
                   font-medium text-brand-800 transition hover:bg-brand-100"
      >
        {downloadLabel}
      </a>
    </div>
  )
}
