import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db/client'
import { ReportRow } from './ReportRow'

export const dynamic = 'force-dynamic'

export default async function AdminReportsPage() {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  const reports = await prisma.report.findMany({
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    take: 100,
    include: {
      procedure: { select: { id: true, titleEn: true, slug: true } },
      handledBy: { select: { name: true } },
    },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ink">User reports</h1>

      {reports.length === 0 ? (
        <p className="rounded-xl2 border border-slate-200 bg-white p-6 text-sm text-ink-faint">
          No reports yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {reports.map((report) => (
            <li key={report.id} className="rounded-xl2 border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium">
                  {report.reason}
                </span>
                <Link
                  href={`/admin/procedures/${report.procedure.id}`}
                  className="font-medium text-brand-700 hover:underline"
                >
                  {report.procedure.titleEn}
                </Link>
                <span className="text-xs text-ink-faint">
                  {report.createdAt.toISOString().slice(0, 16).replace('T', ' ')}
                </span>
                <span className="ml-auto rounded bg-slate-100 px-2 py-0.5 text-xs">
                  {report.status}
                </span>
              </div>

              {report.message && (
                <p className="mt-2 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-sm text-ink-muted">
                  {report.message}
                </p>
              )}
              {report.contactEmail && (
                <p className="mt-1 text-xs text-ink-faint">Contact: {report.contactEmail}</p>
              )}
              {report.resolutionNote && (
                <p className="mt-1 text-xs text-ink-muted">
                  Resolution: {report.resolutionNote}
                  {report.handledBy ? ` (${report.handledBy.name})` : ''}
                </p>
              )}

              <ReportRow id={report.id} status={report.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
