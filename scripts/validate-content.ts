/**
 * Content validation gate for CI.
 *
 * Re-runs the publication rules against every PUBLISHED procedure in the
 * database and exits non-zero on any error. Wire this into CI so a published
 * page can never lose its source without the build going red.
 *
 *   npm run validate:content
 */

import { ContentStatus, PrismaClient } from '@prisma/client'
import { validateProcedureForPublication } from '../src/lib/content/validate'

const prisma = new PrismaClient()

async function main() {
  const procedures = await prisma.procedure.findMany({
    where: { status: ContentStatus.PUBLISHED },
    include: {
      steps: true,
      documents: { include: { document: true } },
      fees: true,
      sources: true,
    },
  })

  let errors = 0
  let warnings = 0

  for (const procedure of procedures) {
    const result = validateProcedureForPublication({
      ...procedure,
      documents: procedure.documents.map((entry) => ({
        basis: entry.basis,
        sourceId: entry.sourceId,
        documentNameEn: entry.document.nameEn,
      })),
    })

    for (const issue of result.issues) {
      if (issue.severity === 'error') errors += 1
      else warnings += 1
      console.log(
        `${issue.severity === 'error' ? '✕' : '!'} ${procedure.slug} — ${issue.field}: ${issue.message}`,
      )
    }
  }

  console.log(
    `\nChecked ${procedures.length} published procedures: ${errors} errors, ${warnings} warnings.`,
  )
  if (errors > 0) process.exitCode = 1
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
