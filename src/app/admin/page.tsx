import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ContentStatus, ReportStatus, VerificationStatus } from '@prisma/client'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db/client'
import { listOutdatedProcedures } from '@/lib/content/queries'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  const [published, drafts, newReports, conflicts, outdated, recentAudit] =
    await Promise.all([
      prisma.procedure.count({ where: { status: ContentStatus.PUBLISHED } }),
      prisma.procedure.count({ where: { status: { not: ContentStatus.PUBLISHED } } }),
      prisma.report.count({ where: { status: ReportStatus.NEW } }),
      prisma.procedure.count({
        where: { verificationStatus: VerificationStatus.SOURCE_CONFLICT },
      }),
      listOutdatedProcedures(),
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: { admin: { select: { name: true } } },
      }),
    ])

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-ink">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Published" value={published} href="/admin/procedures" />
        <Stat label="Unpublished" value={drafts} href="/admin/procedures" />
        <Stat
          label="Needs re-verification"
          value={outdated.length}
          href="/admin/outdated"
          tone={outdated.length > 0 ? 'warn' : undefined}
        />
        <Stat
          label="Source conflicts"
          value={conflicts}
          href="/admin/procedures"
          tone={conflicts > 0 ? 'danger' : undefined}
        />
        <Stat
          label="New reports"
          value={newReports}
          href="/admin/reports"
          tone={newReports > 0 ? 'warn' : undefined}
        />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-bold text-ink">Recent activity</h2>
        <ul className="divide-y divide-slate-200 overflow-hidden rounded-xl2 border border-slate-200 bg-white">
          {recentAudit.length === 0 && (
            <li className="p-4 text-sm text-ink-faint">No activity yet.</li>
          )}
          {recentAudit.map((entry) => (
            <li key={entry.id} className="flex flex-wrap gap-x-3 p-3 text-sm">
              <span className="font-mono text-xs text-ink-faint">
                {entry.createdAt.toISOString().slice(0, 16).replace('T', ' ')}
              </span>
              <span className="font-medium text-ink">{entry.action}</span>
              <span className="text-ink-muted">{entry.summary}</span>
              <span className="ml-auto text-xs text-ink-faint">
                {entry.admin?.name ?? 'system'}
              </span>
            </li>
          ))}
        </ul>
        <Link
          href="/admin/audit"
          className="mt-2 inline-block text-sm font-medium text-brand-700 hover:underline"
        >
          Full audit log →
        </Link>
      </section>
    </div>
  )
}

function Stat({
  label,
  value,
  href,
  tone,
}: {
  label: string
  value: number
  href: string
  tone?: 'warn' | 'danger'
}) {
  const toneClass =
    tone === 'danger'
      ? 'border-red-300 bg-red-50'
      : tone === 'warn'
        ? 'border-amber-300 bg-amber-50'
        : 'border-slate-200 bg-white'

  return (
    <Link href={href} className={`rounded-xl2 border p-4 transition hover:shadow-sm ${toneClass}`}>
      <p className="text-2xl font-bold text-ink">{value}</p>
      <p className="text-sm text-ink-muted">{label}</p>
    </Link>
  )
}
