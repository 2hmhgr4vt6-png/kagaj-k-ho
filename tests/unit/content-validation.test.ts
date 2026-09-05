import { describe, expect, it } from 'vitest'
import {
  AppointmentRequirement,
  ClaimBasis,
  ContentStatus,
  VerificationStatus,
} from '@prisma/client'
import {
  canPublish,
  validateProcedureForPublication,
  type ValidatableProcedure,
} from '@/lib/content/validate'

function makeValid(overrides: Partial<ValidatableProcedure> = {}): ValidatableProcedure {
  return {
    slug: 'e-passport',
    titleEn: 'E-passport',
    titleNe: 'इ-राहदानी',
    summaryEn: 'Summary',
    summaryNe: 'सारांश',
    status: ContentStatus.PUBLISHED,
    verificationStatus: VerificationStatus.VERIFIED,
    lastVerifiedAt: new Date('2026-09-05'),
    nextReviewAt: new Date('2026-12-04'),
    processingTimeEn: null,
    processingTimeBasis: ClaimBasis.UNKNOWN,
    appointmentRequirement: AppointmentRequirement.REQUIRED,
    steps: [
      {
        order: 1,
        titleEn: 'Pre-enroll online',
        titleNe: 'अनलाइन फारम भर्नुहोस्',
        basis: ClaimBasis.OFFICIALLY_STATED,
        sourceId: 'src-1',
      },
    ],
    documents: [
      {
        basis: ClaimBasis.OFFICIALLY_STATED,
        sourceId: 'src-1',
        documentNameEn: 'Citizenship certificate',
      },
    ],
    fees: [],
    sources: [
      {
        url: 'https://nepalpassport.gov.np/en/process/process-23',
        title: 'Applying for a passport in Nepal',
        organization: 'Department of Passports',
        checkedAt: new Date('2026-09-05'),
      },
    ],
    ...overrides,
  }
}

function errorsOf(procedure: ValidatableProcedure) {
  return validateProcedureForPublication(procedure).issues.filter(
    (issue) => issue.severity === 'error',
  )
}

describe('validateProcedureForPublication', () => {
  it('accepts a fully sourced record', () => {
    expect(canPublish(makeValid())).toBe(true)
  })

  it('blocks a record with no steps', () => {
    const errors = errorsOf(makeValid({ steps: [] }))
    expect(errors.some((e) => e.field === 'steps')).toBe(true)
  })

  it('blocks a record with no source', () => {
    expect(canPublish(makeValid({ sources: [] }))).toBe(false)
  })

  it('blocks a record with no lastVerifiedAt', () => {
    const errors = errorsOf(makeValid({ lastVerifiedAt: null }))
    expect(errors.some((e) => e.field === 'lastVerifiedAt')).toBe(true)
  })

  it('blocks a record with no scheduled review date', () => {
    const errors = errorsOf(makeValid({ nextReviewAt: null }))
    expect(errors.some((e) => e.field === 'nextReviewAt')).toBe(true)
  })

  it('blocks a missing title in either language', () => {
    expect(canPublish(makeValid({ titleNe: '' }))).toBe(false)
    expect(canPublish(makeValid({ titleEn: '' }))).toBe(false)
  })

  it('blocks a fee stated as official with no source', () => {
    const errors = errorsOf(
      makeValid({
        fees: [
          {
            labelEn: 'Passport fee',
            basis: ClaimBasis.OFFICIALLY_STATED,
            sourceId: null,
            amountNpr: 5000,
          },
        ],
      }),
    )
    expect(errors.some((e) => e.field === 'fees')).toBe(true)
  })

  it('allows an explicitly unverified fee', () => {
    // "We do not know" is always a publishable answer.
    expect(
      canPublish(
        makeValid({
          fees: [
            {
              labelEn: 'Passport fee',
              basis: ClaimBasis.UNKNOWN,
              sourceId: null,
              amountNpr: null,
              amountTextEn: 'Amount not verified — check the official source.',
            },
          ],
        }),
      ),
    ).toBe(true)
  })

  it('blocks processing time stated as official but empty', () => {
    const errors = errorsOf(
      makeValid({
        processingTimeBasis: ClaimBasis.OFFICIALLY_STATED,
        processingTimeEn: '',
      }),
    )
    expect(errors.some((e) => e.field === 'processingTime')).toBe(true)
  })

  it('blocks a document stated as official with no source', () => {
    const errors = errorsOf(
      makeValid({
        documents: [
          {
            basis: ClaimBasis.OFFICIALLY_STATED,
            sourceId: null,
            documentNameEn: 'Made-up document',
          },
        ],
      }),
    )
    expect(errors.some((e) => e.field === 'documents')).toBe(true)
  })

  it('rejects a non-https or relative source URL', () => {
    expect(
      canPublish(
        makeValid({
          sources: [
            {
              url: 'http://example.gov.np/page',
              title: 'Page',
              organization: 'Agency',
              checkedAt: new Date(),
            },
          ],
        }),
      ),
    ).toBe(false)
  })

  it('blocks a source with no checkedAt date', () => {
    expect(
      canPublish(
        makeValid({
          sources: [
            {
              url: 'https://example.gov.np/page',
              title: 'Page',
              organization: 'Agency',
              checkedAt: null,
            },
          ],
        }),
      ),
    ).toBe(false)
  })

  it('blocks duplicate step order values', () => {
    const step = makeValid().steps[0]!
    const errors = errorsOf(makeValid({ steps: [step, { ...step }] }))
    expect(errors.some((e) => e.field === 'steps')).toBe(true)
  })

  it('warns rather than blocks on a user-reported document', () => {
    const result = validateProcedureForPublication(
      makeValid({
        documents: [
          {
            basis: ClaimBasis.USER_REPORTED,
            sourceId: null,
            documentNameEn: 'Extra photocopy',
          },
        ],
      }),
    )
    expect(result.ok).toBe(true)
    expect(result.issues.some((i) => i.severity === 'warning')).toBe(true)
  })
})
