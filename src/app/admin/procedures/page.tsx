import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db/client'
import { resolveVerificationStatus } from '@/lib/content/trust'

export const dynamic = 'force-dynamic'

const DOT: Record<string, string> = {
  VERIFIED: '🟢',
  NEEDS_VERIFICATION: '🟡',
  SOURCE_CONFLICT: '🔴',
  UNAVAILABLE: '🔴',
}

export default async function AdminProceduresPage() {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  const procedures = await prisma.procedure.findMany({
    orderBy: [{ status: 'asc' }, { titleEn: 'asc' }],
    include: {
      category: true,
      _count: { select: { sources: true, steps: true, documents: true } },
    },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ink">Procedures</h1>

      <div className="overflow-x-auto rounded-xl2 border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <caption className="sr-only">All procedures with editorial status</caption>
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-ink-faint">
            <tr>
              <th scope="col" className="p-3">Title</th>
              <th scope="col" className="p-3">Category</th>
              <th scope="col" className="p-3">Status</th>
              <th scope="col" className="p-3">Trust</th>
              <th scope="col" className="p-3">Sources</th>
              <th scope="col" className="p-3">Last verified</th>
              <th scope="col" className="p-3">Next review</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {procedures.map((procedure) => {
              const effective = resolveVerificationStatus(procedure)
              return (
                <tr key={procedure.id} className="hover:bg-slate-50">
                  <td className="p-3">
                    <Link
                      href={`/admin/procedures/${procedure.id}`}
                      className="font-medium text-brand-700 hover:underline"
                    >
                      {procedure.titleEn}
                    </Link>
                    <p className="text-xs text-ink-faint">{procedure.slug}</p>
                  </td>
                  <td className="p-3 text-ink-muted">{procedure.category.nameEn}</td>
                  <td className="p-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs">
                      {procedure.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <span title={effective}>{DOT[effective]}</span>{' '}
                    <span className="text-xs text-ink-faint">{effective}</span>
                  </td>
                  <td className="p-3 text-ink-muted">{procedure._count.sources}</td>
                  <td className="p-3 text-ink-muted">
                    {procedure.lastVerifiedAt?.toISOString().slice(0, 10) ?? '—'}
                  </td>
                  <td className="p-3 text-ink-muted">
                    {procedure.nextReviewAt?.toISOString().slice(0, 10) ?? '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
