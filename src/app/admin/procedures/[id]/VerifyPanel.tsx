'use client'

import { useActionState } from 'react'
import { VerificationStatus } from '@prisma/client'
import { verifyProcedureAction, type ActionState } from '../../actions'

const initial: ActionState = {}

/**
 * Records a fact-check pass. Requires EDITOR; the action also sets
 * `lastVerifiedAt` and the next review date atomically with the record.
 */
export function VerifyPanel({
  procedureId,
  sources,
}: {
  procedureId: string
  sources: Array<{ id: string; label: string }>
}) {
  const [state, formAction, pending] = useActionState(verifyProcedureAction, initial)

  return (
    <form action={formAction} className="space-y-4 rounded-xl2 border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-bold text-ink">Record a fact-check</h2>
      <input type="hidden" name="procedureId" value={procedureId} />

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="outcome" className="mb-1 block text-sm font-medium text-ink">
            Outcome
          </label>
          <select
            id="outcome"
            name="outcome"
            defaultValue={VerificationStatus.VERIFIED}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {Object.values(VerificationStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="sourceId" className="mb-1 block text-sm font-medium text-ink">
            Checked against
          </label>
          <select
            id="sourceId"
            name="sourceId"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">—</option>
            {sources.map((source) => (
              <option key={source.id} value={source.id}>
                {source.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="reviewInDays" className="mb-1 block text-sm font-medium text-ink">
            Re-check in (days)
          </label>
          <input
            id="reviewInDays"
            name="reviewInDays"
            type="number"
            min={1}
            max={365}
            defaultValue={90}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="mb-1 block text-sm font-medium text-ink">
          What did you compare?
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="e.g. Compared the required-documents list line by line against the DoP process page; unchanged."
        />
      </div>

      {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      {state.success && <p role="status" className="text-sm text-green-700">{state.success}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-700 px-5 py-2.5 font-medium text-white disabled:opacity-60"
      >
        {pending ? 'Recording…' : 'Record verification'}
      </button>
    </form>
  )
}
