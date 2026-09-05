import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { listOutdatedProcedures } from '@/lib/content/queries'
import { prisma } from '@/lib/db/client'
import { SourceCheckOutcome, VerificationStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

/**
 * The outdated-content queue: published pages whose review date has passed,
 * plus every record where official sources are recorded as conflicting.
 */
export default async function OutdatedQueuePage() {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  const sourceSelect = {
    id: true,
    url: true,
    title: true,
    lastHttpStatus: true,
    lastCheckOutcome: true,
    lastCheckedAt: true,
    procedure: { select: { id: true, titleEn: true } },
  }

  const [outdated, conflicts, brokenLinks, unreadable, changedSources] =
    await Promise.all([
      listOutdatedProcedures(),
      prisma.procedure.findMany({
        where: { verificationStatus: VerificationStatus.SOURCE_CONFLICT },
        select: { id: true, titleEn: true, slug: true },
      }),
      prisma.officialSource.findMany({
        where: {
          OR: [
            { lastCheckOutcome: SourceCheckOutcome.HTTP_ERROR },
            { lastCheckOutcome: SourceCheckOutcome.UNREACHABLE },
          ],
        },
        select: sourceSelect,
      }),
      prisma.officialSource.findMany({
        where: { lastCheckOutcome: SourceCheckOutcome.THIN_CONTENT },
        select: sourceSelect,
      }),
      // Sources with more than one snapshot have drifted at least once; the
      // most recent snapshot is the version an editor has not yet confirmed.
      prisma.officialSource.findMany({
        where: { snapshots: { some: {} } },
        select: {
          ...sourceSelect,
          snapshots: {
            orderBy: { capturedAt: 'desc' },
            take: 2,
            select: { capturedAt: true, mainTextLength: true },
          },
        },
      }),
    ])

  const drifted = changedSources.filter((source) => source.snapshots.length > 1)

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
                {source.lastHttpStatus ? `HTTP ${source.lastHttpStatus}` : 'UNREACHABLE'}
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

      {/* The most important panel on this page. A source here responds 200, so
          it looks healthy everywhere else — but its content is not in the HTML
          we can read, which means an unchanged hash proves nothing about it. */}
      <Panel
        title="Sources whose content cannot be read automatically"
        empty="Every source served readable content on the last check."
        count={unreadable.length}
      >
        <div className="border-b border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
          These pages return HTTP 200 but serve their body client-side, so the
          drift detector cannot tell whether the content changed. Re-read them by
          hand at the interval you would use for an unmonitored source.
        </div>
        <ul className="divide-y divide-slate-100">
          {unreadable.map((source) => (
            <li key={source.id} className="p-3 text-sm">
              <p className="font-medium text-ink">{source.title}</p>
              <span className="break-all text-xs text-ink-muted">{source.url}</span>
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

      <Panel
        title="Sources that changed since a previous snapshot"
        empty="No source has drifted since its first snapshot."
        count={drifted.length}
      >
        <ul className="divide-y divide-slate-100">
          {drifted.map((source) => (
            <li key={source.id} className="p-3 text-sm">
              <p className="font-medium text-ink">{source.title}</p>
              <span className="break-all text-xs text-ink-muted">{source.url}</span>
              <p className="mt-1 text-xs text-ink-faint">
                last change {source.snapshots[0]?.capturedAt.toISOString().slice(0, 10)} ·{' '}
                {source.snapshots[1]?.mainTextLength} → {source.snapshots[0]?.mainTextLength} chars
              </p>
              {source.procedure && (
                <Link
                  href={`/admin/procedures/${source.procedure.id}`}
                  className="text-brand-700 hover:underline"
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
