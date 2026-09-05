import type { ReactNode } from 'react'
import Link from 'next/link'
import '../globals.css'
import { getSession } from '@/lib/auth/session'
import { LogoutButton } from './LogoutButton'

export const metadata = {
  title: 'Admin — Kagaj K Ho?',
  // The admin panel must never be indexed.
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession()

  const links = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/procedures', label: 'Procedures' },
    { href: '/admin/outdated', label: 'Outdated queue' },
    { href: '/admin/sources', label: 'Sources' },
    { href: '/admin/reports', label: 'Reports' },
    { href: '/admin/audit', label: 'Audit log' },
  ]

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-100">
        {session && (
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
              <Link href="/admin" className="font-bold text-ink">
                कागज के हो? <span className="text-ink-faint">admin</span>
              </Link>
              <nav className="flex flex-wrap gap-1">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-lg px-3 py-1.5 text-sm text-ink-muted hover:bg-slate-100"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="ml-auto flex items-center gap-3 text-sm">
                <span className="text-ink-faint">
                  {session.name} · {session.role}
                </span>
                <LogoutButton />
              </div>
            </div>
          </header>
        )}
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  )
}
