'use client'

import { useActionState } from 'react'
import { ContentStatus } from '@prisma/client'
import {
  publishProcedureAction,
  unpublishProcedureAction,
  type ActionState,
} from '../../actions'

const initial: ActionState = {}

export function PublishPanel({
  id,
  status,
  canPublish,
}: {
  id: string
  status: ContentStatus
  canPublish: boolean
}) {
  const [publishState, publish, publishing] = useActionState(publishProcedureAction, initial)
  const [unpublishState, unpublish, unpublishing] = useActionState(
    unpublishProcedureAction,
    initial,
  )

  const isPublished = status === ContentStatus.PUBLISHED

  return (
    <section className="flex flex-wrap items-center gap-3 rounded-xl2 border border-slate-200 bg-white p-4">
      {!isPublished ? (
        <form action={publish}>
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            disabled={!canPublish || publishing}
            title={canPublish ? undefined : 'Fix the blocking validation errors first.'}
            className="rounded-lg bg-green-700 px-5 py-2.5 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {publishing ? 'Publishing…' : 'Publish'}
          </button>
        </form>
      ) : (
        <form action={unpublish}>
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            disabled={unpublishing}
            className="rounded-lg border border-red-300 bg-red-50 px-5 py-2.5 font-medium text-red-800 disabled:opacity-60"
          >
            {unpublishing ? 'Unpublishing…' : 'Unpublish'}
          </button>
        </form>
      )}

      <p className="text-sm text-ink-muted">
        Current status: <strong>{status}</strong>
      </p>

      {(publishState.error || unpublishState.error) && (
        <p role="alert" className="w-full whitespace-pre-line text-sm text-red-700">
          {publishState.error ?? unpublishState.error}
        </p>
      )}
      {(publishState.success || unpublishState.success) && (
        <p role="status" className="w-full text-sm text-green-700">
          {publishState.success ?? unpublishState.success}
        </p>
      )}
    </section>
  )
}
