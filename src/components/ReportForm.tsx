'use client'

import { useState } from 'react'
import type { Locale } from '@/lib/i18n/config'
import { track } from '@/lib/analytics/track'

const REASONS = [
  'FEE_CHANGED',
  'DOCUMENTS_CHANGED',
  'OFFICE_CHANGED',
  'LINK_BROKEN',
  'PROCESS_CHANGED',
  'OTHER',
] as const

type Labels = {
  trigger: string
  title: string
  intro: string
  reason: string
  reasonLabels: Record<(typeof REASONS)[number], string>
  message: string
  email: string
  submit: string
  submitting: string
  success: string
  error: string
  rateLimited: string
  privacyNote: string
}

/**
 * "यो जानकारी गलत/पुरानो छ?" — collapsed by default so it never competes with
 * the content, and deliberately asks for no identity documents.
 */
export function ReportForm({
  procedureSlug,
  locale,
  labels,
}: {
  procedureSlug: string
  locale: Locale
  labels: Labels
}) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<(typeof REASONS)[number]>('DOCUMENTS_CHANGED')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error' | 'limited'>('idle')

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setState('sending')
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ procedureSlug, reason, message, contactEmail: email }),
      })

      if (response.status === 429) {
        setState('limited')
        return
      }
      if (!response.ok) {
        setState('error')
        return
      }

      track('report_outdated', { slug: procedureSlug, reason, locale })
      setState('sent')
      setMessage('')
      setEmail('')
    } catch {
      setState('error')
    }
  }

  if (state === 'sent') {
    return (
      <div
        role="status"
        className="rounded-xl2 border border-green-200 bg-green-50 p-4 text-sm text-green-900"
      >
        {labels.success}
      </div>
    )
  }

  return (
    <section className="no-print rounded-xl2 border border-slate-200 bg-white p-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 text-left font-semibold text-brand-700"
      >
        <span>{labels.trigger}</span>
        <span aria-hidden="true">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <p className="text-sm text-ink-muted">{labels.intro}</p>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-ink">{labels.reason}</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {REASONS.map((value) => (
                <label
                  key={value}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border
                             border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={value}
                    checked={reason === value}
                    onChange={() => setReason(value)}
                    className="text-brand-700"
                  />
                  <span>{labels.reasonLabels[value]}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="report-message" className="mb-1 block text-sm font-medium text-ink">
              {labels.message}
            </label>
            <textarea
              id="report-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={2000}
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="report-email" className="mb-1 block text-sm font-medium text-ink">
              {labels.email}
            </label>
            <input
              id="report-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              maxLength={254}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-ink-faint">{labels.privacyNote}</p>
          </div>

          {state === 'error' && (
            <p role="alert" className="text-sm text-red-700">
              {labels.error}
            </p>
          )}
          {state === 'limited' && (
            <p role="alert" className="text-sm text-red-700">
              {labels.rateLimited}
            </p>
          )}

          <button
            type="submit"
            disabled={state === 'sending'}
            className="rounded-lg bg-brand-700 px-5 py-2.5 font-medium text-white
                       transition hover:bg-brand-800 disabled:opacity-60"
          >
            {state === 'sending' ? labels.submitting : labels.submit}
          </button>
        </form>
      )}
    </section>
  )
}
