import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db/client'

export const dynamic = 'force-dynamic'

export default async function AdminSourcesPage() {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  const sources = await prisma.officialSource.findMany({
    orderBy: [{ organization: 'asc' }, { checkedAt: 'desc' }],
    include: {
      procedure: { select: { id: true, titleEn: true } },
      _count: { select: { snapshots: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Sources</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Run <code className="rounded bg-slate-200 px-1">npm run check:sources</code> to refresh
          HTTP status and content hashes.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl2 border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <caption className="sr-only">Official sources</caption>
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-ink-faint">
            <tr>
              <th scope="col" className="p-3">Organization</th>
              <th scope="col" className="p-3">Title / URL</th>
              <th scope="col" className="p-3">Type</th>
              <th scope="col" className="p-3">Procedure</th>
              <th scope="col" className="p-3">Checked</th>
              <th scope="col" className="p-3">HTTP</th>
              <th scope="col" className="p-3">Snapshots</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sources.map((source) => (
              <tr key={source.id} className="hover:bg-slate-50">
                <td className="p-3 font-medium text-ink">{source.organization}</td>
                <td className="max-w-md p-3">
                  <p className="text-ink">{source.title}</p>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-xs text-brand-700 hover:underline"
                  >
                    {source.url}
                  </a>
                </td>
                <td className="p-3 text-xs text-ink-muted">{source.sourceType}</td>
                <td className="p-3">
                  {source.procedure && (
                    <Link
                      href={`/admin/procedures/${source.procedure.id}`}
                      className="text-brand-700 hover:underline"
                    >
                      {source.procedure.titleEn}
                    </Link>
                  )}
                </td>
                <td className="p-3 text-ink-muted">
                  {source.checkedAt.toISOString().slice(0, 10)}
                </td>
                <td className="p-3">
                  <span
                    className={
                      source.lastHttpStatus && source.lastHttpStatus >= 400
                        ? 'font-medium text-red-700'
                        : 'text-ink-muted'
                    }
                  >
                    {source.lastHttpStatus ?? '—'}
                  </span>
                </td>
                <td className="p-3 text-ink-muted">{source._count.snapshots}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
