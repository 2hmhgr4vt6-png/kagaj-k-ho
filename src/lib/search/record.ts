import 'server-only'
import { prisma } from '@/lib/db/client'

/**
 * Bumps the per-procedure search counter that powers "सबैभन्दा धेरै खोजिएका".
 *
 * Only procedure IDs are recorded — the query string itself is never persisted,
 * because search text is exactly the field where users volunteer personal
 * details we do not want.
 */
export async function recordSearch(query: string, procedureIds: string[]): Promise<void> {
  if (!query.trim() || procedureIds.length === 0) return
  try {
    await prisma.procedure.updateMany({
      where: { id: { in: procedureIds.slice(0, 5) } },
      data: { searchCount: { increment: 1 } },
    })
  } catch {
    // Non-critical: never fail a search page over a counter.
  }
}
