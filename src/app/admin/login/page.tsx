import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { LoginForm } from './LoginForm'

export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  if (await getSession()) redirect('/admin')

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-bold text-ink">Admin sign in</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Kagaj K Ho? content administration.
      </p>
      <div className="mt-6 rounded-xl2 border border-slate-200 bg-white p-6">
        <LoginForm />
      </div>
    </div>
  )
}
