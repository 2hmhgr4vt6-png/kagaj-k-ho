import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db/client'

export const dynamic = 'force-dynamic'

export default async function AdminAuditPage() {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { admin: { select: { name: true, email: true } } },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ink">Audit log</h1>

      <div className="overflow-x-auto rounded-xl2 border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <caption className="sr-only">Recorded content changes</caption>
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-ink-faint">
            <tr>
              <th scope="col" className="p-3">When</th>
              <th scope="col" className="p-3">Who</th>
              <th scope="col" className="p-3">Action</th>
              <th scope="col" className="p-3">Entity</th>
              <th scope="col" className="p-3">Summary</th>
              <th scope="col" className="p-3">Diff</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-ink-faint">
                  No entries yet.
                </td>
              </tr>
            )}
            {logs.map((log) => (
              <tr key={log.id} className="align-top hover:bg-slate-50">
                <td className="whitespace-nowrap p-3 font-mono text-xs text-ink-faint">
                  {log.createdAt.toISOString().slice(0, 16).replace('T', ' ')}
                </td>
                <td className="p-3 text-ink-muted">{log.admin?.name ?? 'system'}</td>
                <td className="p-3 font-medium text-ink">{log.action}</td>
                <td className="p-3 text-xs text-ink-faint">
                  {log.entityType}
                  <br />
                  {log.entityId}
                </td>
                <td className="p-3 text-ink-muted">{log.summary}</td>
                <td className="max-w-xs p-3">
                  {log.diff ? (
                    <details>
                      <summary className="cursor-pointer text-xs text-brand-700">view</summary>
                      <pre className="mt-1 overflow-x-auto rounded bg-slate-50 p-2 text-[0.7rem]">
                        {JSON.stringify(log.diff, null, 2)}
                      </pre>
                    </details>
                  ) : (
                    <span className="text-xs text-ink-faint">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
