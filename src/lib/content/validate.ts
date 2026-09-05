import {
  ClaimBasis,
  ContentStatus,
  VerificationStatus,
  type AppointmentRequirement,
} from '@prisma/client'

/**
 * Publication gate. These rules are the reason the 🟢 badge means anything:
 * a record cannot reach PUBLISHED unless every officially-stated claim points
 * at a source we actually opened.
 *
 * "Unknown" is always allowed — saying "not verified" is a valid answer and is
 * strictly better than inventing a number.
 */

export type ValidatableFee = {
  labelEn: string
  basis: ClaimBasis
  sourceId?: string | null
  amountNpr?: number | null
  amountTextEn?: string | null
}

export type ValidatableDocument = {
  basis: ClaimBasis
  sourceId?: string | null
  documentNameEn: string
}

export type ValidatableStep = {
  order: number
  titleEn: string
  titleNe: string
  basis: ClaimBasis
  sourceId?: string | null
}

export type ValidatableSource = {
  url: string
  title: string
  organization: string
  checkedAt: Date | null
}

export type ValidatableProcedure = {
  slug: string
  titleEn: string
  titleNe: string
  summaryEn: string
  summaryNe: string
  status: ContentStatus
  verificationStatus: VerificationStatus
  lastVerifiedAt: Date | null
  nextReviewAt: Date | null
  processingTimeEn?: string | null
  processingTimeBasis: ClaimBasis
  appointmentRequirement: AppointmentRequirement
  steps: ValidatableStep[]
  documents: ValidatableDocument[]
  fees: ValidatableFee[]
  sources: ValidatableSource[]
}

export type ValidationIssue = {
  field: string
  message: string
  /** `error` blocks publication; `warning` is surfaced in the admin queue only. */
  severity: 'error' | 'warning'
}

export type ValidationResult = {
  ok: boolean
  issues: ValidationIssue[]
}

const HTTPS_URL = /^https:\/\/[^\s]+$/i

export function validateProcedureForPublication(
  procedure: ValidatableProcedure,
): ValidationResult {
  const issues: ValidationIssue[] = []
  const err = (field: string, message: string) =>
    issues.push({ field, message, severity: 'error' })
  const warn = (field: string, message: string) =>
    issues.push({ field, message, severity: 'warning' })

  // --- Always-required shape -------------------------------------------------
  if (!procedure.slug?.trim()) err('slug', 'Slug is required.')
  if (!procedure.titleEn?.trim()) err('titleEn', 'English title is required.')
  if (!procedure.titleNe?.trim()) err('titleNe', 'Nepali title is required.')
  if (!procedure.summaryEn?.trim()) err('summaryEn', 'English summary is required.')
  if (!procedure.summaryNe?.trim()) err('summaryNe', 'Nepali summary is required.')

  if (procedure.steps.length === 0) {
    err('steps', 'At least one step is required before publishing.')
  }

  const orders = procedure.steps.map((s) => s.order)
  if (new Set(orders).size !== orders.length) {
    err('steps', 'Step order values must be unique.')
  }
  for (const step of procedure.steps) {
    if (!step.titleEn?.trim() || !step.titleNe?.trim()) {
      err(`steps[${step.order}]`, 'Each step needs both a Nepali and an English title.')
    }
  }

  // --- Sources ---------------------------------------------------------------
  if (procedure.sources.length === 0) {
    err('sources', 'At least one official source URL is required.')
  }
  for (const source of procedure.sources) {
    if (!HTTPS_URL.test(source.url)) {
      err('sources', `Source URL must be an absolute https URL: "${source.url}"`)
    }
    if (!source.title?.trim()) err('sources', 'Every source needs a title.')
    if (!source.organization?.trim()) {
      err('sources', 'Every source needs the publishing organization.')
    }
    if (!source.checkedAt) {
      err('sources', `Source "${source.title}" has no checkedAt date.`)
    }
  }

  // --- Claim-level sourcing --------------------------------------------------
  // An "officially stated" claim without a source is exactly the failure mode
  // this product exists to prevent.
  for (const fee of procedure.fees) {
    if (fee.basis === ClaimBasis.OFFICIALLY_STATED && !fee.sourceId) {
      err(
        'fees',
        `Fee "${fee.labelEn}" is marked officially stated but has no source. ` +
          'Attach a source or change the basis to UNKNOWN.',
      )
    }
    if (
      fee.basis !== ClaimBasis.UNKNOWN &&
      fee.amountNpr == null &&
      !fee.amountTextEn?.trim()
    ) {
      err('fees', `Fee "${fee.labelEn}" has a basis but no amount.`)
    }
  }

  for (const doc of procedure.documents) {
    if (doc.basis === ClaimBasis.OFFICIALLY_STATED && !doc.sourceId) {
      err(
        'documents',
        `Document "${doc.documentNameEn}" is marked officially stated but has no source.`,
      )
    }
    if (doc.basis === ClaimBasis.USER_REPORTED) {
      warn(
        'documents',
        `Document "${doc.documentNameEn}" is user-reported and will be labelled as such, ` +
          'never as an official requirement.',
      )
    }
  }

  for (const step of procedure.steps) {
    if (step.basis === ClaimBasis.OFFICIALLY_STATED && !step.sourceId) {
      err('steps', `Step ${step.order} is marked officially stated but has no source.`)
    }
  }

  if (
    procedure.processingTimeBasis === ClaimBasis.OFFICIALLY_STATED &&
    !procedure.processingTimeEn?.trim()
  ) {
    err('processingTime', 'Processing time is marked officially stated but is empty.')
  }
  if (
    procedure.processingTimeEn?.trim() &&
    procedure.processingTimeBasis === ClaimBasis.UNKNOWN
  ) {
    warn(
      'processingTime',
      'Processing time has text but an UNKNOWN basis; it will render as "not verified".',
    )
  }

  // --- Verification bookkeeping ---------------------------------------------
  if (!procedure.lastVerifiedAt) {
    err('lastVerifiedAt', 'lastVerifiedAt is required before publishing.')
  }
  if (!procedure.nextReviewAt) {
    err('nextReviewAt', 'A scheduled review date is required before publishing.')
  }

  if (procedure.verificationStatus === VerificationStatus.VERIFIED) {
    const primarySourced = procedure.sources.length > 0
    if (!primarySourced) {
      err(
        'verificationStatus',
        'A procedure marked VERIFIED must have at least one official source.',
      )
    }
    if (!procedure.lastVerifiedAt) {
      err(
        'verificationStatus',
        'A procedure marked VERIFIED must record when it was verified.',
      )
    }
    const unverifiedClaims = [
      ...procedure.fees.filter((f) => f.basis === ClaimBasis.UNKNOWN),
      ...procedure.documents.filter((d) => d.basis === ClaimBasis.UNKNOWN),
    ]
    if (unverifiedClaims.length > 0) {
      warn(
        'verificationStatus',
        `${unverifiedClaims.length} claim(s) are unverified; they will render as ` +
          '"Not verified — check the official source."',
      )
    }
  }

  return { ok: issues.every((i) => i.severity !== 'error'), issues }
}

export function canPublish(procedure: ValidatableProcedure): boolean {
  return validateProcedureForPublication(procedure).ok
}
