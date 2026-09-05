'use client'

import { useActionState } from 'react'
import { ClaimBasis } from '@prisma/client'
import type { ProcedureDetail } from '@/lib/content/queries'
import { updateProcedureAction, type ActionState } from '../../actions'

const initial: ActionState = {}

export function ProcedureEditor({ procedure }: { procedure: ProcedureDetail }) {
  const [state, formAction, pending] = useActionState(updateProcedureAction, initial)

  return (
    <form action={formAction} className="space-y-4 rounded-xl2 border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-bold text-ink">Content</h2>
      <input type="hidden" name="id" value={procedure.id} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title (English)" name="titleEn" defaultValue={procedure.titleEn} required />
        <Field label="Title (नेपाली)" name="titleNe" defaultValue={procedure.titleNe} required />
        <TextArea label="Summary (English)" name="summaryEn" defaultValue={procedure.summaryEn} required />
        <TextArea label="Summary (नेपाली)" name="summaryNe" defaultValue={procedure.summaryNe} required />
        <TextArea label="Eligibility (English)" name="eligibilityEn" defaultValue={procedure.eligibilityEn ?? ''} />
        <TextArea label="Eligibility (नेपाली)" name="eligibilityNe" defaultValue={procedure.eligibilityNe ?? ''} />
        <TextArea label="Where to apply (English)" name="whereToApplyEn" defaultValue={procedure.whereToApplyEn ?? ''} />
        <TextArea label="Where to apply (नेपाली)" name="whereToApplyNe" defaultValue={procedure.whereToApplyNe ?? ''} />
        <Field label="Processing time (English)" name="processingTimeEn" defaultValue={procedure.processingTimeEn ?? ''} />
        <Field label="Processing time (नेपाली)" name="processingTimeNe" defaultValue={procedure.processingTimeNe ?? ''} />
        <TextArea label="Notes / exceptions (English)" name="notesEn" defaultValue={procedure.notesEn ?? ''} />
        <TextArea label="Notes / exceptions (नेपाली)" name="notesNe" defaultValue={procedure.notesNe ?? ''} />
      </div>

      <div>
        <label htmlFor="processingTimeBasis" className="mb-1 block text-sm font-medium text-ink">
          Processing-time basis
        </label>
        <select
          id="processingTimeBasis"
          name="processingTimeBasis"
          defaultValue={procedure.processingTimeBasis}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {Object.values(ClaimBasis).map((basis) => (
            <option key={basis} value={basis}>
              {basis}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-ink-faint">
          Only mark a claim OFFICIALLY_STATED when the wording appears on an attached source.
        </p>
      </div>

      {state.error && (
        <p role="alert" className="whitespace-pre-line text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-sm text-green-700">
          {state.success}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-700 px-5 py-2.5 font-medium text-white disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}

function Field({
  label,
  name,
  defaultValue,
  required,
}: {
  label: string
  name: string
  defaultValue: string
  required?: boolean
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={name}
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
    </div>
  )
}

function TextArea({
  label,
  name,
  defaultValue,
  required,
}: {
  label: string
  name: string
  defaultValue: string
  required?: boolean
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-ink">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        defaultValue={defaultValue}
        required={required}
        rows={3}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
    </div>
  )
}
