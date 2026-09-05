import 'server-only'
import { prisma } from '@/lib/db/client'

export type AuditInput = {
  adminId: string | null
  action: string
  entityType: string
  entityId: string
  summary: string
  diff?: Record<string, { from: unknown; to: unknown }>
}

/**
 * Records a content change. Every write path in the admin panel calls this —
 * the audit trail is what lets an editor answer "who changed this fee, when,
 * and against which source?".
 */
export async function recordAudit(input: AuditInput): Promise<void> {
  await prisma.auditLog.create({
    data: {
      adminId: input.adminId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      summary: input.summary,
      diff: input.diff ? (input.diff as object) : undefined,
    },
  })
}

/** Shallow diff of the fields that changed, for the audit `diff` column. */
export function shallowDiff<T extends Record<string, unknown>>(
  before: T,
  after: Partial<T>,
): Record<string, { from: unknown; to: unknown }> {
  const diff: Record<string, { from: unknown; to: unknown }> = {}
  for (const [key, nextValue] of Object.entries(after)) {
    const previous = before[key]
    if (serialize(previous) !== serialize(nextValue)) {
      diff[key] = { from: previous ?? null, to: nextValue ?? null }
    }
  }
  return diff
}

function serialize(value: unknown): string {
  if (value instanceof Date) return value.toISOString()
  return JSON.stringify(value ?? null)
}
