import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { listOutdatedProcedures } from '@/lib/content/queries'
import { prisma } from '@/lib/db/client'
import { VerificationStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

/**
 * The outdated-content queue: published pages whose review date has passed,
 * plus every record where official sources are recorded as conflicting.
 */
export default async function OutdatedQueuePage() {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  const [outdated, conflicts, brokenLinks] = await Promise.all([
    listOutdatedProcedures(),
    prisma.procedure.findMany({
      where: { verificationStatus: VerificationStatus.SOURCE_CONFLICT },
      select: { id: true, titleEn: true, slug: true },
    }),
    prisma.officialSource.findMany({
      where: { lastHttpStatus: { gte: 400 } },
      select: {
        id: true,
        url: true,
        lastHttpStatus: true,
        title: true,
        procedure: { select: { id: true, titleEn: true } },
      },
    }),
  ])

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-ink">Outdated content queue</h1>

      <Panel
        title="Past review date"
        empty="Nothing is overdue. 🎉"
        count={outdated.length}
      >
        <ul className="divide-y divide-slate-100">
          {outdated.map((procedure) => (
            <li key={procedure.id} className="flex flex-wrap items-center gap-3 p-3 text-sm">
              <Link
                href={`/admin/procedures/${procedure.id}`}
                className="font-medium text-brand-700 hover:underline"
              >
                {procedure.titleEn}
              </Link>
              <span className="text-ink-faint">
                next review:{' '}
                {procedure.nextReviewAt?.toISOString().slice(0, 10) ?? 'never set'}
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel
        title="Source conflicts"
        empty="No recorded conflicts."
        count={conflicts.length}
      >
        <ul className="divide-y divide-slate-100">
          {conflicts.map((procedure) => (
            <li key={procedure.id} className="p-3 text-sm">
              <Link
                href={`/admin/procedures/${procedure.id}`}
                className="font-medium text-brand-700 hover:underline"
              >
                {procedure.titleEn}
              </Link>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel
        title="Source URLs failing"
        empty="No failing source URLs recorded. Run `npm run check:sources` to refresh."
        count={brokenLinks.length}
      >
        <ul className="divide-y divide-slate-100">
          {brokenLinks.map((source) => (
            <li key={source.id} className="p-3 text-sm">
              <span className="font-mono text-xs text-red-700">
                HTTP {source.lastHttpStatus}
              </span>{' '}
              <span className="break-all">{source.url}</span>
              {source.procedure && (
                <Link
                  href={`/admin/procedures/${source.procedure.id}`}
                  className="ml-2 text-brand-700 hover:underline"
                >
                  {source.procedure.titleEn}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}

function Panel({
  title,
  count,
  empty,
  children,
}: {
  title: string
  count: number
  empty: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-bold text-ink">
        {title} <span className="text-ink-faint">({count})</span>
      </h2>
      <div className="overflow-hidden rounded-xl2 border border-slate-200 bg-white">
        {count === 0 ? <p className="p-4 text-sm text-ink-faint">{empty}</p> : children}
      </div>
    </section>
  )
}
