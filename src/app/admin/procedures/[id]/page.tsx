import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { getProcedureForAdmin } from '@/lib/content/queries'
import { validateProcedureForPublication } from '@/lib/content/validate'
import { prisma } from '@/lib/db/client'
import { ProcedureEditor } from './ProcedureEditor'
import { VerifyPanel } from './VerifyPanel'
import { PublishPanel } from './PublishPanel'
import { AddSourceForm } from './AddSourceForm'

export const dynamic = 'force-dynamic'

export default async function AdminProcedurePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  const { id } = await params
  const procedure = await getProcedureForAdmin(id)
  if (!procedure) notFound()

  const validation = validateProcedureForPublication({
    ...procedure,
    documents: procedure.documents.map((entry) => ({
      basis: entry.basis,
      sourceId: entry.sourceId,
      documentNameEn: entry.document.nameEn,
    })),
  })

  const versions = await prisma.procedureVersion.findMany({
    where: { procedureId: id },
    orderBy: { version: 'desc' },
    take: 10,
    include: { createdBy: { select: { name: true } } },
  })

  const auditLogs = await prisma.auditLog.findMany({
    where: { entityType: 'Procedure', entityId: id },
    orderBy: { createdAt: 'desc' },
    take: 15,
    include: { admin: { select: { name: true } } },
  })

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">{procedure.titleEn}</h1>
          <p className="text-sm text-ink-faint">
            {procedure.slug} · {procedure.status} · {procedure.verificationStatus}
          </p>
        </div>
        <Link
          href={`/ne/services/${procedure.slug}`}
          target="_blank"
          className="ml-auto rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
        >
          View public page ↗
        </Link>
      </header>

      {/* Validation gate: shown before anything else, because it decides
          whether this record may go live at all. */}
      <section
        className={`rounded-xl2 border p-4 ${
          validation.ok ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
        }`}
      >
        <h2 className="font-bold text-ink">
          {validation.ok ? 'Passes publication checks' : 'Blocked from publication'}
        </h2>
        {validation.issues.length > 0 && (
          <ul className="mt-2 space-y-1 text-sm">
            {validation.issues.map((issue, index) => (
              <li
                key={index}
                className={issue.severity === 'error' ? 'text-red-800' : 'text-amber-900'}
              >
                <strong>{issue.severity === 'error' ? '✕' : '!'} {issue.field}:</strong>{' '}
                {issue.message}
              </li>
            ))}
          </ul>
        )}
      </section>

      <PublishPanel id={procedure.id} status={procedure.status} canPublish={validation.ok} />

      <ProcedureEditor procedure={procedure} />

      <VerifyPanel
        procedureId={procedure.id}
        sources={procedure.sources.map((source) => ({
          id: source.id,
          label: `${source.organization} — ${source.title}`,
        }))}
      />

      <section>
        <h2 className="mb-3 text-lg font-bold text-ink">
          Official sources ({procedure.sources.length})
        </h2>
        <ul className="mb-4 space-y-2">
          {procedure.sources.map((source) => (
            <li key={source.id} className="rounded-xl2 border border-slate-200 bg-white p-3 text-sm">
              <p className="font-medium text-ink">
                {source.organization} — {source.title}
              </p>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-brand-700 hover:underline"
              >
                {source.url}
              </a>
              <p className="mt-1 text-xs text-ink-faint">
                {source.sourceType} · checked {source.checkedAt.toISOString().slice(0, 10)}
                {source.lastHttpStatus ? ` · HTTP ${source.lastHttpStatus}` : ''}
              </p>
            </li>
          ))}
        </ul>
        <AddSourceForm procedureId={procedure.id} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-ink">Version history</h2>
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl2 border border-slate-200 bg-white text-sm">
          {versions.length === 0 && (
            <li className="p-3 text-ink-faint">No published versions yet.</li>
          )}
          {versions.map((version) => (
            <li key={version.id} className="flex flex-wrap gap-3 p-3">
              <span className="font-mono text-xs">v{version.version}</span>
              <span className="text-ink-muted">{version.changeNote}</span>
              <span className="ml-auto text-xs text-ink-faint">
                {version.createdBy?.name ?? 'system'} ·{' '}
                {version.createdAt.toISOString().slice(0, 10)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-ink">Audit history</h2>
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl2 border border-slate-200 bg-white text-sm">
          {auditLogs.length === 0 && <li className="p-3 text-ink-faint">No changes logged.</li>}
          {auditLogs.map((entry) => (
            <li key={entry.id} className="flex flex-wrap gap-3 p-3">
              <span className="font-mono text-xs text-ink-faint">
                {entry.createdAt.toISOString().slice(0, 16).replace('T', ' ')}
              </span>
              <span className="font-medium">{entry.action}</span>
              <span className="text-ink-muted">{entry.summary}</span>
              <span className="ml-auto text-xs text-ink-faint">
                {entry.admin?.name ?? 'system'}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
