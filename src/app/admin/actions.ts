'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import {
  AdminRole,
  ClaimBasis,
  ContentStatus,
  ReportStatus,
  VerificationStatus,
} from '@prisma/client'
import { prisma } from '@/lib/db/client'
import {
  createSession,
  destroySession,
  getSession,
  hasRole,
  requireRole,
  verifyPassword,
} from '@/lib/auth/session'
import { recordAudit, shallowDiff } from '@/lib/audit'
import { validateProcedureForPublication } from '@/lib/content/validate'
import { buildSearchText } from '@/lib/search/normalize'
import { clientIpFrom, rateLimit } from '@/lib/rate-limit'
import { headers } from 'next/headers'
import { addDays } from '@/lib/dates'

export type ActionState = { error?: string; success?: string }

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(200),
})

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ip = clientIpFrom(await headers()) ?? 'anonymous'
  // Throttle credential stuffing before touching bcrypt.
  const limited = rateLimit(`login:${ip}`, { limit: 10, windowMs: 15 * 60_000 })
  if (!limited.ok) return { error: 'Too many attempts. Try again later.' }

  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) return { error: 'Invalid email or password.' }

  const admin = await prisma.admin.findUnique({ where: { email: parsed.data.email } })

  // Always run a comparison so a missing account and a wrong password take
  // indistinguishable time.
  const placeholder = '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin'
  const ok = await verifyPassword(parsed.data.password, admin?.passwordHash ?? placeholder)

  if (!admin || !admin.isActive || !ok) {
    return { error: 'Invalid email or password.' }
  }

  await createSession({
    adminId: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  })
  await prisma.admin.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  })
  await recordAudit({
    adminId: admin.id,
    action: 'admin.login',
    entityType: 'Admin',
    entityId: admin.id,
    summary: `${admin.email} signed in`,
  })

  redirect('/admin')
}

export async function logoutAction(): Promise<void> {
  await destroySession()
  redirect('/admin/login')
}

// ---------------------------------------------------------------------------
// Procedure editing
// ---------------------------------------------------------------------------

const procedureUpdateSchema = z.object({
  id: z.string().min(1),
  titleEn: z.string().min(1).max(300),
  titleNe: z.string().min(1).max(300),
  summaryEn: z.string().min(1).max(2000),
  summaryNe: z.string().min(1).max(2000),
  eligibilityEn: z.string().max(5000).optional(),
  eligibilityNe: z.string().max(5000).optional(),
  whereToApplyEn: z.string().max(5000).optional(),
  whereToApplyNe: z.string().max(5000).optional(),
  processingTimeEn: z.string().max(500).optional(),
  processingTimeNe: z.string().max(500).optional(),
  processingTimeBasis: z.nativeEnum(ClaimBasis),
  notesEn: z.string().max(5000).optional(),
  notesNe: z.string().max(5000).optional(),
})

export async function updateProcedureAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession()
  if (!hasRole(session, AdminRole.CONTRIBUTOR)) return { error: 'Not authorized.' }

  const parsed = procedureUpdateSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') }
  }

  const { id, ...fields } = parsed.data
  const before = await prisma.procedure.findUnique({
    where: { id },
    include: { category: true, aliases: true },
  })
  if (!before) return { error: 'Procedure not found.' }

  const updated = await prisma.procedure.update({
    where: { id },
    data: {
      ...fields,
      // The searchable blob is derived, so it is rebuilt on every content edit
      // rather than being editable on its own.
      searchText: buildSearchText({
        titleNe: fields.titleNe,
        titleEn: fields.titleEn,
        summaryNe: fields.summaryNe,
        summaryEn: fields.summaryEn,
        categoryNe: before.category.nameNe,
        categoryEn: before.category.nameEn,
        aliases: before.aliases.map((alias) => alias.alias),
      }),
    },
  })

  await recordAudit({
    adminId: session!.adminId,
    action: 'procedure.update',
    entityType: 'Procedure',
    entityId: id,
    summary: `Updated "${updated.titleEn}"`,
    diff: shallowDiff(before as unknown as Record<string, unknown>, fields),
  })

  revalidatePath(`/admin/procedures/${id}`)
  return { success: 'Saved.' }
}

/**
 * Records a fact-check pass. This is the only way `lastVerifiedAt` moves — it
 * always creates a VerificationRecord alongside, so the badge on the public
 * page is always backed by an auditable event.
 */
const verifySchema = z.object({
  procedureId: z.string().min(1),
  sourceId: z.string().optional(),
  outcome: z.nativeEnum(VerificationStatus),
  notes: z.string().max(2000).optional(),
  reviewInDays: z.coerce.number().int().min(1).max(365).default(90),
})

export async function verifyProcedureAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession()
  if (!hasRole(session, AdminRole.EDITOR)) return { error: 'Not authorized.' }

  const parsed = verifySchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: 'Invalid verification input.' }

  const now = new Date()
  const nextReviewAt = addDays(now, parsed.data.reviewInDays)

  await prisma.$transaction([
    prisma.verificationRecord.create({
      data: {
        procedureId: parsed.data.procedureId,
        sourceId: parsed.data.sourceId || null,
        adminId: session!.adminId,
        outcome: parsed.data.outcome,
        notes: parsed.data.notes || null,
        verifiedAt: now,
        nextReviewAt,
      },
    }),
    prisma.procedure.update({
      where: { id: parsed.data.procedureId },
      data: {
        verificationStatus: parsed.data.outcome,
        lastVerifiedAt: now,
        nextReviewAt,
      },
    }),
  ])

  await recordAudit({
    adminId: session!.adminId,
    action: 'procedure.verify',
    entityType: 'Procedure',
    entityId: parsed.data.procedureId,
    summary: `Verification recorded: ${parsed.data.outcome}`,
  })

  revalidatePath(`/admin/procedures/${parsed.data.procedureId}`)
  return { success: 'Verification recorded.' }
}

/**
 * Publish. Runs the full content-validation gate and refuses on any error —
 * this is the enforcement point for "no verified page without a source".
 */
export async function publishProcedureAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession()
  if (!hasRole(session, AdminRole.EDITOR)) return { error: 'Not authorized.' }

  const id = String(formData.get('id') ?? '')
  const procedure = await prisma.procedure.findUnique({
    where: { id },
    include: {
      steps: true,
      documents: { include: { document: true } },
      fees: true,
      sources: true,
    },
  })
  if (!procedure) return { error: 'Procedure not found.' }

  const result = validateProcedureForPublication({
    ...procedure,
    documents: procedure.documents.map((entry) => ({
      basis: entry.basis,
      sourceId: entry.sourceId,
      documentNameEn: entry.document.nameEn,
    })),
  })

  if (!result.ok) {
    return {
      error:
        'Cannot publish:\n' +
        result.issues
          .filter((issue) => issue.severity === 'error')
          .map((issue) => `• ${issue.field}: ${issue.message}`)
          .join('\n'),
    }
  }

  // Snapshot the record as an immutable version before it goes live.
  const latestVersion = await prisma.procedureVersion.findFirst({
    where: { procedureId: id },
    orderBy: { version: 'desc' },
    select: { version: true },
  })

  await prisma.$transaction([
    prisma.procedure.update({
      where: { id },
      data: { status: ContentStatus.PUBLISHED, publishedAt: new Date() },
    }),
    prisma.procedureVersion.create({
      data: {
        procedureId: id,
        version: (latestVersion?.version ?? 0) + 1,
        payload: JSON.parse(JSON.stringify(procedure)),
        changeNote: 'Published',
        createdById: session!.adminId,
      },
    }),
  ])

  await recordAudit({
    adminId: session!.adminId,
    action: 'procedure.publish',
    entityType: 'Procedure',
    entityId: id,
    summary: `Published "${procedure.titleEn}"`,
  })

  revalidatePath('/admin/procedures')
  revalidatePath(`/ne/services/${procedure.slug}`)
  revalidatePath(`/en/services/${procedure.slug}`)
  return { success: 'Published.' }
}

export async function unpublishProcedureAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession()
  if (!hasRole(session, AdminRole.EDITOR)) return { error: 'Not authorized.' }

  const id = String(formData.get('id') ?? '')
  const procedure = await prisma.procedure.update({
    where: { id },
    data: { status: ContentStatus.IN_REVIEW },
  })

  await recordAudit({
    adminId: session!.adminId,
    action: 'procedure.unpublish',
    entityType: 'Procedure',
    entityId: id,
    summary: `Unpublished "${procedure.titleEn}"`,
  })

  revalidatePath('/admin/procedures')
  return { success: 'Unpublished.' }
}

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------

const sourceSchema = z.object({
  procedureId: z.string().min(1),
  organization: z.string().min(1).max(300),
  title: z.string().min(1).max(500),
  url: z.string().url().startsWith('https://').max(2000),
  sourceType: z.enum([
    'GOVERNMENT_AGENCY',
    'GOVERNMENT_PORTAL',
    'GAZETTE_OR_LAW',
    'LOCAL_GOVERNMENT',
    'REPUTABLE_SECONDARY',
  ]),
  notes: z.string().max(2000).optional(),
})

export async function addSourceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession()
  if (!hasRole(session, AdminRole.CONTRIBUTOR)) return { error: 'Not authorized.' }

  const parsed = sourceSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: 'Source needs an organization, a title and an absolute https URL.' }
  }

  const source = await prisma.officialSource.create({
    data: {
      ...parsed.data,
      notes: parsed.data.notes || null,
      isPrimary: parsed.data.sourceType !== 'REPUTABLE_SECONDARY',
      checkedAt: new Date(),
    },
  })

  await recordAudit({
    adminId: session!.adminId,
    action: 'source.create',
    entityType: 'OfficialSource',
    entityId: source.id,
    summary: `Added source ${source.url}`,
  })

  revalidatePath(`/admin/procedures/${parsed.data.procedureId}`)
  return { success: 'Source added.' }
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

const reportUpdateSchema = z.object({
  id: z.string().min(1),
  status: z.nativeEnum(ReportStatus),
  resolutionNote: z.string().max(2000).optional(),
})

export async function updateReportAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(AdminRole.CONTRIBUTOR).catch(() => null)
  if (!session) return { error: 'Not authorized.' }

  const parsed = reportUpdateSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: 'Invalid input.' }

  await prisma.report.update({
    where: { id: parsed.data.id },
    data: {
      status: parsed.data.status,
      resolutionNote: parsed.data.resolutionNote || null,
      handledById: session.adminId,
    },
  })

  await recordAudit({
    adminId: session.adminId,
    action: 'report.update',
    entityType: 'Report',
    entityId: parsed.data.id,
    summary: `Report marked ${parsed.data.status}`,
  })

  revalidatePath('/admin/reports')
  return { success: 'Updated.' }
}
