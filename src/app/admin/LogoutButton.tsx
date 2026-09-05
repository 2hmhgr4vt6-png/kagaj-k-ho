'use client'

import { logoutAction } from './actions'

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-ink-muted hover:bg-slate-50"
      >
        Sign out
      </button>
    </form>
  )
}
