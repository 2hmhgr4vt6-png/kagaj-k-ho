/**
 * Seeds the database with fact-checked content only.
 *
 * Idempotent: safe to re-run. Procedures are keyed by slug and their child
 * rows (steps, documents, fees, sources) are rebuilt on each run so the seed
 * file stays the single source of truth for seeded content.
 */

import { PrismaClient, ContentStatus, VerificationStatus } from '@prisma/client'
import { hash } from 'bcryptjs'
import { categories, lifeEvents, documents, offices, VERIFIED_ON, NEXT_REVIEW } from './seed-data'
import { procedures, siteFaqs } from './seed-procedures'
import { buildSearchText } from '../src/lib/search/normalize'
import { validateProcedureForPublication } from '../src/lib/content/validate'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Kagaj K Ho?…')

  const admin = await seedAdmin()
  await seedTaxonomy()
  await seedDocuments()
  await seedOffices()
  await seedProcedures(admin.id)
  await seedSiteFaqs()

  console.log('Done.')
}

// ---------------------------------------------------------------------------

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com'
  const password = process.env.SEED_ADMIN_PASSWORD

  if (!password) {
    throw new Error('SEED_ADMIN_PASSWORD is not set. See .env.example.')
  }
  // A placeholder password must never reach a real deployment.
  if (process.env.NODE_ENV === 'production' && password === 'change-me-locally') {
    throw new Error('Refusing to seed the placeholder admin password in production.')
  }

  const admin = await prisma.admin.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: 'Seed Owner',
      passwordHash: await hash(password, 12),
      role: 'OWNER',
    },
  })

  console.log(`  admin: ${admin.email}`)
  return admin
}

async function seedTaxonomy() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    })
  }
  for (const event of lifeEvents) {
    await prisma.lifeEvent.upsert({
      where: { slug: event.slug },
      update: event,
      create: event,
    })
  }
  console.log(`  ${categories.length} categories, ${lifeEvents.length} life events`)
}

async function seedDocuments() {
  for (const document of documents) {
    await prisma.requiredDocument.upsert({
      where: { slug: document.slug },
      update: document,
      create: document,
    })
  }
  console.log(`  ${documents.length} document definitions`)
}

async function seedOffices() {
  for (const { hours, ...office } of offices) {
    const record = await prisma.office.upsert({
      where: { slug: office.slug },
      update: office,
      create: office,
    })

    for (const hour of hours) {
      await prisma.officeHour.upsert({
        where: { officeId_dayOfWeek: { officeId: record.id, dayOfWeek: hour.dayOfWeek } },
        update: hour,
        create: { ...hour, officeId: record.id },
      })
    }
  }
  console.log(`  ${offices.length} offices`)
}

async function seedProcedures(adminId: string) {
  for (const seed of procedures) {
    const category = await prisma.category.findUniqueOrThrow({
      where: { slug: seed.categorySlug },
    })

    const isPublished = seed.status === ContentStatus.PUBLISHED
    const searchText = buildSearchText({
      titleNe: seed.titleNe,
      titleEn: seed.titleEn,
      summaryNe: seed.summaryNe,
      summaryEn: seed.summaryEn,
      categoryNe: category.nameNe,
      categoryEn: category.nameEn,
      aliases: seed.aliases,
    })

    const base = {
      titleNe: seed.titleNe,
      titleEn: seed.titleEn,
      summaryNe: seed.summaryNe,
      summaryEn: seed.summaryEn,
      eligibilityNe: seed.eligibilityNe,
      eligibilityEn: seed.eligibilityEn,
      whereToApplyNe: seed.whereToApplyNe,
      whereToApplyEn: seed.whereToApplyEn,
      notesNe: seed.notesNe,
      notesEn: seed.notesEn,
      processingTimeNe: seed.processingTimeNe,
      processingTimeEn: seed.processingTimeEn,
      processingTimeBasis: seed.processingTimeBasis,
      appointmentRequirement: seed.appointmentRequirement,
      appointmentNoteNe: seed.appointmentNoteNe,
      appointmentNoteEn: seed.appointmentNoteEn,
      appointmentUrl: seed.appointmentUrl,
      status: seed.status,
      verificationStatus: seed.verificationStatus,
      confidence: seed.confidence,
      metaTitleNe: seed.metaTitleNe ?? null,
      metaTitleEn: seed.metaTitleEn ?? null,
      metaDescriptionNe: seed.metaDescriptionNe ?? null,
      metaDescriptionEn: seed.metaDescriptionEn ?? null,
      // Only a record we actually fact-checked carries a verification date.
      lastVerifiedAt: isPublished ? VERIFIED_ON : null,
      nextReviewAt: isPublished ? NEXT_REVIEW : null,
      publishedAt: isPublished ? VERIFIED_ON : null,
      categoryId: category.id,
      searchText,
    }

    const procedure = await prisma.procedure.upsert({
      where: { slug: seed.slug },
      update: base,
      create: { slug: seed.slug, ...base },
    })

    // Rebuild child rows so the seed file remains authoritative.
    await prisma.$transaction([
      prisma.procedureStep.deleteMany({ where: { procedureId: procedure.id } }),
      prisma.procedureDocument.deleteMany({ where: { procedureId: procedure.id } }),
      prisma.fee.deleteMany({ where: { procedureId: procedure.id } }),
      prisma.officialSource.deleteMany({ where: { procedureId: procedure.id } }),
      prisma.faq.deleteMany({ where: { procedureId: procedure.id } }),
      prisma.notice.deleteMany({ where: { procedureId: procedure.id } }),
      prisma.procedureAlias.deleteMany({ where: { procedureId: procedure.id } }),
      prisma.procedureLifeEvent.deleteMany({ where: { procedureId: procedure.id } }),
      prisma.procedureOffice.deleteMany({ where: { procedureId: procedure.id } }),
    ])

    // Sources first: every other row references them by key.
    const sourceIdByKey = new Map<string, string>()
    for (const source of seed.sources) {
      const created = await prisma.officialSource.create({
        data: {
          procedureId: procedure.id,
          organization: source.organization,
          title: source.title,
          url: source.url,
          sourceType: source.sourceType,
          isPrimary: source.isPrimary,
          notes: source.notes ?? null,
          checkedAt: VERIFIED_ON,
        },
      })
      sourceIdByKey.set(source.key, created.id)
    }

    const resolve = (key: string | null | undefined) =>
      key ? (sourceIdByKey.get(key) ?? null) : null

    for (const [index, step] of seed.steps.entries()) {
      await prisma.procedureStep.create({
        data: {
          procedureId: procedure.id,
          order: index + 1,
          titleNe: step.titleNe,
          titleEn: step.titleEn,
          detailNe: step.detailNe ?? null,
          detailEn: step.detailEn ?? null,
          actionUrl: step.actionUrl ?? null,
          basis: step.basis,
          sourceId: resolve(step.sourceKey),
        },
      })
    }

    for (const [index, entry] of seed.documents.entries()) {
      const document = await prisma.requiredDocument.findUniqueOrThrow({
        where: { slug: entry.slug },
      })
      await prisma.procedureDocument.create({
        data: {
          procedureId: procedure.id,
          documentId: document.id,
          order: index + 1,
          isMandatory: entry.isMandatory,
          conditionNe: entry.conditionNe ?? null,
          conditionEn: entry.conditionEn ?? null,
          basis: entry.basis,
          sourceId: resolve(entry.sourceKey),
        },
      })
    }

    for (const [index, fee] of seed.fees.entries()) {
      await prisma.fee.create({
        data: {
          procedureId: procedure.id,
          labelNe: fee.labelNe,
          labelEn: fee.labelEn,
          kind: fee.kind,
          amountNpr: fee.amountNpr,
          amountTextNe: fee.amountTextNe ?? null,
          amountTextEn: fee.amountTextEn ?? null,
          basis: fee.basis,
          sourceId: resolve(fee.sourceKey),
          order: index + 1,
        },
      })
    }

    for (const [index, faq] of seed.faqs.entries()) {
      await prisma.faq.create({
        data: {
          procedureId: procedure.id,
          questionNe: faq.questionNe,
          questionEn: faq.questionEn,
          answerNe: faq.answerNe,
          answerEn: faq.answerEn,
          basis: faq.basis,
          sourceUrl: faq.sourceUrl,
          order: index + 1,
        },
      })
    }

    for (const notice of seed.notices) {
      await prisma.notice.create({
        data: {
          procedureId: procedure.id,
          level: notice.level,
          titleNe: notice.titleNe,
          titleEn: notice.titleEn,
          bodyNe: notice.bodyNe,
          bodyEn: notice.bodyEn,
          sourceUrl: notice.sourceUrl,
        },
      })
    }

    for (const alias of seed.aliases) {
      await prisma.procedureAlias.create({
        data: { procedureId: procedure.id, alias, kind: 'translit' },
      })
    }

    for (const slug of seed.lifeEventSlugs) {
      const event = await prisma.lifeEvent.findUniqueOrThrow({ where: { slug } })
      await prisma.procedureLifeEvent.create({
        data: { procedureId: procedure.id, lifeEventId: event.id },
      })
    }

    for (const office of seed.officeSlugs) {
      const record = await prisma.office.findUniqueOrThrow({ where: { slug: office.slug } })
      await prisma.procedureOffice.create({
        data: {
          procedureId: procedure.id,
          officeId: record.id,
          roleNe: office.roleNe,
          roleEn: office.roleEn,
        },
      })
    }

    // A published seed record must satisfy the same gate the admin UI enforces.
    // Failing loudly here is the point: it stops unsourced content shipping.
    if (isPublished) {
      const full = await prisma.procedure.findUniqueOrThrow({
        where: { id: procedure.id },
        include: {
          steps: true,
          documents: { include: { document: true } },
          fees: true,
          sources: true,
        },
      })
      const result = validateProcedureForPublication({
        ...full,
        documents: full.documents.map((entry) => ({
          basis: entry.basis,
          sourceId: entry.sourceId,
          documentNameEn: entry.document.nameEn,
        })),
      })
      if (!result.ok) {
        throw new Error(
          `Seed procedure "${seed.slug}" fails publication validation:\n` +
            result.issues
              .filter((issue) => issue.severity === 'error')
              .map((issue) => `  • ${issue.field}: ${issue.message}`)
              .join('\n'),
        )
      }

      await prisma.verificationRecord.create({
        data: {
          procedureId: procedure.id,
          sourceId: sourceIdByKey.values().next().value ?? null,
          adminId,
          outcome: VerificationStatus.VERIFIED,
          notes:
            'Initial fact-check: every published claim on this record was transcribed from the attached official source on the date shown.',
          verifiedAt: VERIFIED_ON,
          nextReviewAt: NEXT_REVIEW,
        },
      })

      await prisma.procedureVersion.upsert({
        where: { procedureId_version: { procedureId: procedure.id, version: 1 } },
        update: {},
        create: {
          procedureId: procedure.id,
          version: 1,
          payload: JSON.parse(JSON.stringify(full)),
          changeNote: 'Initial seeded version',
          createdById: adminId,
        },
      })
    }

    console.log(`  procedure: ${seed.slug} (${seed.status})`)
  }
}

async function seedSiteFaqs() {
  await prisma.faq.deleteMany({ where: { procedureId: null } })
  for (const faq of siteFaqs) {
    await prisma.faq.create({ data: faq })
  }
  console.log(`  ${siteFaqs.length} site FAQs`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
