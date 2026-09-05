'use client'

import { useActionState } from 'react'
import { SourceType } from '@prisma/client'
import { addSourceAction, type ActionState } from '../../actions'

const initial: ActionState = {}

export function AddSourceForm({ procedureId }: { procedureId: string }) {
  const [state, formAction, pending] = useActionState(addSourceAction, initial)

  return (
    <form action={formAction} className="space-y-3 rounded-xl2 border border-slate-200 bg-white p-4">
      <h3 className="font-bold text-ink">Add a source</h3>
      <input type="hidden" name="procedureId" value={procedureId} />

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="organization"
          required
          placeholder="Organization (e.g. Department of Passports)"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          name="title"
          required
          placeholder="Page title"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          name="url"
          type="url"
          required
          placeholder="https://…"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
        />
        <select
          name="sourceType"
          defaultValue={SourceType.GOVERNMENT_AGENCY}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {Object.values(SourceType).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <input
          name="notes"
          placeholder="Notes (optional)"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      {state.success && <p role="status" className="text-sm text-green-700">{state.success}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-brand-300 bg-brand-50 px-4 py-2 text-sm font-medium text-brand-800 disabled:opacity-60"
      >
        {pending ? 'Adding…' : 'Add source'}
      </button>
    </form>
  )
}
