import { describe, expect, it } from 'vitest'
import { ClaimBasis, ContentStatus, VerificationStatus } from '@prisma/client'
import { prisma } from '@/lib/db/client'
import { validateProcedureForPublication } from '@/lib/content/validate'
import { getPublishedProcedure } from '@/lib/content/queries'

/**
 * Content-integrity tests over the seeded database.
 *
 * These are the guardrails that make the trust badges meaningful — they assert
 * product invariants, not implementation details.
 */
describe('published content invariants', () => {
  it('every published procedure passes the publication gate', async () => {
    const procedures = await prisma.procedure.findMany({
      where: { status: ContentStatus.PUBLISHED },
      include: {
        steps: true,
        documents: { include: { document: true } },
        fees: true,
        sources: true,
      },
    })

    expect(procedures.length).toBeGreaterThan(0)

    for (const procedure of procedures) {
      const result = validateProcedureForPublication({
        ...procedure,
        documents: procedure.documents.map((entry) => ({
          basis: entry.basis,
          sourceId: entry.sourceId,
          documentNameEn: entry.document.nameEn,
        })),
      })
      const errors = result.issues.filter((issue) => issue.severity === 'error')
      expect(errors, `${procedure.slug}: ${JSON.stringify(errors)}`).toEqual([])
    }
  })

  it('every VERIFIED procedure has at least one primary official source', async () => {
    const procedures = await prisma.procedure.findMany({
      where: { verificationStatus: VerificationStatus.VERIFIED },
      include: { sources: true },
    })

    for (const procedure of procedures) {
      expect(
        procedure.sources.some((source) => source.isPrimary),
        `${procedure.slug} has no primary source`,
      ).toBe(true)
    }
  })

  it('every source URL is an absolute https URL on a .gov.np domain or explicitly secondary', async () => {
    const sources = await prisma.officialSource.findMany()
    expect(sources.length).toBeGreaterThan(0)

    for (const source of sources) {
      expect(source.url).toMatch(/^https:\/\//)
      if (source.sourceType !== 'REPUTABLE_SECONDARY') {
        expect(
          new URL(source.url).hostname.endsWith('.gov.np'),
          `${source.url} is marked primary but is not a .gov.np host`,
        ).toBe(true)
      }
    }
  })

  it('no officially-stated claim exists without a source', async () => {
    const [fees, documents, steps] = await Promise.all([
      prisma.fee.count({
        where: { basis: ClaimBasis.OFFICIALLY_STATED, sourceId: null },
      }),
      prisma.procedureDocument.count({
        where: { basis: ClaimBasis.OFFICIALLY_STATED, sourceId: null },
      }),
      prisma.procedureStep.count({
        where: { basis: ClaimBasis.OFFICIALLY_STATED, sourceId: null },
      }),
    ])

    expect({ fees, documents, steps }).toEqual({ fees: 0, documents: 0, steps: 0 })
  })

  it('every published procedure has both Nepali and English content', async () => {
    const procedures = await prisma.procedure.findMany({
      where: { status: ContentStatus.PUBLISHED },
      include: { steps: true },
    })

    for (const procedure of procedures) {
      expect(procedure.titleNe.trim().length).toBeGreaterThan(0)
      expect(procedure.titleEn.trim().length).toBeGreaterThan(0)
      expect(procedure.summaryNe.trim().length).toBeGreaterThan(0)
      expect(procedure.summaryEn.trim().length).toBeGreaterThan(0)
      for (const step of procedure.steps) {
        expect(step.titleNe.trim().length).toBeGreaterThan(0)
        expect(step.titleEn.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('never attaches a number to an unverified fee, on any procedure', async () => {
    // The core guard against the most tempting invention in this domain. An
    // UNKNOWN-basis fee may carry explanatory text, but never an amount.
    const fees = await prisma.fee.findMany({ where: { basis: ClaimBasis.UNKNOWN } })
    for (const fee of fees) {
      expect(fee.amountNpr, `"${fee.labelEn}" has an amount but an UNKNOWN basis`).toBeNull()
    }
  })

  it('every passport fee amount is sourced to the official fee page', async () => {
    const procedure = await getPublishedProcedure('e-passport')
    expect(procedure).not.toBeNull()

    const priced = procedure!.fees.filter((fee) => fee.amountNpr !== null)
    expect(priced.length).toBeGreaterThan(0)

    for (const fee of priced) {
      expect(fee.basis).toBe(ClaimBasis.OFFICIALLY_STATED)
      expect(fee.source?.url).toBe('https://nepalpassport.gov.np/process/-41')
    }

    // Spot-check the two headline amounts actually published in the table.
    const byLabel = new Map(procedure!.fees.map((fee) => [fee.labelEn, fee.amountNpr]))
    expect(byLabel.get('New / renewal — 34 pages')).toBe(12000)
    expect(byLabel.get('New / renewal — 66 pages')).toBe(20000)
    expect(byLabel.get('Where the office made the error')).toBe(0)
  })

  it('unverified procedures are never published', async () => {
    const leaked = await prisma.procedure.findMany({
      where: { status: ContentStatus.PUBLISHED, lastVerifiedAt: null },
      select: { slug: true },
    })
    expect(leaked).toEqual([])
  })

  it('every published procedure records at least one verification pass', async () => {
    const procedures = await prisma.procedure.findMany({
      where: { status: ContentStatus.PUBLISHED },
      include: { verifications: true },
    })
    for (const procedure of procedures) {
      expect(
        procedure.verifications.length,
        `${procedure.slug} has no verification record`,
      ).toBeGreaterThan(0)
    }
  })
})
