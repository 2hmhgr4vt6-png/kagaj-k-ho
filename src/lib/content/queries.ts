import { ContentStatus, Prisma } from '@prisma/client'
import { prisma } from '@/lib/db/client'

const procedureDetailInclude = {
  category: true,
  steps: { orderBy: { order: 'asc' }, include: { source: true } },
  documents: {
    orderBy: { order: 'asc' },
    include: { document: true, source: true },
  },
  fees: { orderBy: { order: 'asc' }, include: { source: true } },
  sources: { orderBy: [{ isPrimary: 'desc' }, { checkedAt: 'desc' }] },
  offices: { include: { office: { include: { hours: true } } } },
  faqs: { orderBy: { order: 'asc' } },
  notices: { orderBy: { startsAt: 'desc' } },
  lifeEvents: { include: { lifeEvent: true } },
  verifications: { orderBy: { verifiedAt: 'desc' }, take: 5 },
} satisfies Prisma.ProcedureInclude

export type ProcedureDetail = Prisma.ProcedureGetPayload<{
  include: typeof procedureDetailInclude
}>

export async function getPublishedProcedure(slug: string): Promise<ProcedureDetail | null> {
  return prisma.procedure.findFirst({
    where: { slug, status: ContentStatus.PUBLISHED },
    include: procedureDetailInclude,
  })
}

/** Admin preview: any status. */
export async function getProcedureForAdmin(id: string): Promise<ProcedureDetail | null> {
  return prisma.procedure.findUnique({ where: { id }, include: procedureDetailInclude })
}

const procedureCardSelect = {
  id: true,
  slug: true,
  titleEn: true,
  titleNe: true,
  summaryEn: true,
  summaryNe: true,
  verificationStatus: true,
  lastVerifiedAt: true,
  nextReviewAt: true,
  category: { select: { slug: true, nameEn: true, nameNe: true, icon: true } },
} satisfies Prisma.ProcedureSelect

export type ProcedureCard = Prisma.ProcedureGetPayload<{ select: typeof procedureCardSelect }>

export async function listPublishedProcedures(options?: {
  categorySlug?: string
  lifeEventSlug?: string
  take?: number
}): Promise<ProcedureCard[]> {
  return prisma.procedure.findMany({
    where: {
      status: ContentStatus.PUBLISHED,
      ...(options?.categorySlug ? { category: { slug: options.categorySlug } } : {}),
      ...(options?.lifeEventSlug
        ? { lifeEvents: { some: { lifeEvent: { slug: options.lifeEventSlug } } } }
        : {}),
    },
    select: procedureCardSelect,
    orderBy: [{ viewCount: 'desc' }, { titleEn: 'asc' }],
    take: options?.take,
  })
}

export async function listMostSearched(take = 6): Promise<ProcedureCard[]> {
  return prisma.procedure.findMany({
    where: { status: ContentStatus.PUBLISHED },
    select: procedureCardSelect,
    orderBy: [{ searchCount: 'desc' }, { viewCount: 'desc' }],
    take,
  })
}

export async function listRecentlyVerified(take = 6): Promise<ProcedureCard[]> {
  return prisma.procedure.findMany({
    where: { status: ContentStatus.PUBLISHED, lastVerifiedAt: { not: null } },
    select: procedureCardSelect,
    orderBy: { lastVerifiedAt: 'desc' },
    take,
  })
}

export async function listCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: { select: { procedures: { where: { status: ContentStatus.PUBLISHED } } } },
    },
  })
}

export async function listLifeEvents() {
  return prisma.lifeEvent.findMany({ orderBy: { sortOrder: 'asc' } })
}

export async function getCategory(slug: string) {
  return prisma.category.findUnique({ where: { slug } })
}

export async function getLifeEvent(slug: string) {
  return prisma.lifeEvent.findUnique({ where: { slug } })
}

/**
 * Increments the aggregate view counter. Fire-and-forget: a failed counter
 * update must never take down a content page.
 */
export async function incrementViewCount(id: string): Promise<void> {
  try {
    await prisma.procedure.update({ where: { id }, data: { viewCount: { increment: 1 } } })
  } catch {
    // Non-critical.
  }
}

/** Procedures whose scheduled review date has passed — the admin work queue. */
export async function listOutdatedProcedures(now = new Date()) {
  return prisma.procedure.findMany({
    where: {
      status: ContentStatus.PUBLISHED,
      OR: [{ nextReviewAt: { lt: now } }, { nextReviewAt: null }, { lastVerifiedAt: null }],
    },
    select: { ...procedureCardSelect, status: true, updatedAt: true },
    orderBy: { nextReviewAt: 'asc' },
  })
}
