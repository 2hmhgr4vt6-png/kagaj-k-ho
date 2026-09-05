'use client'

import { useActionState } from 'react'
import { ReportStatus } from '@prisma/client'
import { updateReportAction, type ActionState } from '../actions'

const initial: ActionState = {}

export function ReportRow({ id, status }: { id: string; status: ReportStatus }) {
  const [state, formAction, pending] = useActionState(updateReportAction, initial)

  return (
    <form action={formAction} className="mt-3 flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <label htmlFor={`status-${id}`} className="sr-only">
        Status
      </label>
      <select
        id={`status-${id}`}
        name="status"
        defaultValue={status}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
      >
        {Object.values(ReportStatus).map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
      <label htmlFor={`note-${id}`} className="sr-only">
        Resolution note
      </label>
      <input
        id={`note-${id}`}
        name="resolutionNote"
        placeholder="Resolution note"
        className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Update'}
      </button>
      {state.error && <span className="text-sm text-red-700">{state.error}</span>}
      {state.success && <span className="text-sm text-green-700">{state.success}</span>}
    </form>
  )
}
