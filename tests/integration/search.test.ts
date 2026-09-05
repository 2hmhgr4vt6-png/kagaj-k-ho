import { beforeAll, describe, expect, it } from 'vitest'
import { prisma } from '@/lib/db/client'
import { searchProcedures } from '@/lib/search/search'

/**
 * Search integration tests. These run against the seeded database, so they
 * verify the whole path: trigram index, transliteration, ranking.
 *
 * Requires `npm run db:seed` to have been run.
 */
describe('searchProcedures', () => {
  beforeAll(async () => {
    const count = await prisma.procedure.count({ where: { status: 'PUBLISHED' } })
    if (count === 0) {
      throw new Error('No published procedures. Run `npm run db:seed` first.')
    }
  })

  it('finds the passport procedure by its English name', async () => {
    const results = await searchProcedures('passport')
    expect(results[0]?.slug).toBe('e-passport')
  })

  it('finds the passport procedure by its Nepali name', async () => {
    const results = await searchProcedures('राहदानी')
    expect(results.map((r) => r.slug)).toContain('e-passport')
  })

  it('finds the passport procedure by a romanised Nepali query', async () => {
    const results = await searchProcedures('passport banaune')
    expect(results.map((r) => r.slug)).toContain('e-passport')
  })

  it('finds the national ID procedure in Nepali', async () => {
    const results = await searchProcedures('राष्ट्रिय परिचयपत्र')
    expect(results.map((r) => r.slug)).toContain('national-id-card')
  })

  it('finds the national ID procedure by the "nid" alias', async () => {
    const results = await searchProcedures('nid')
    expect(results.map((r) => r.slug)).toContain('national-id-card')
  })

  it('finds birth registration in Nepali', async () => {
    const results = await searchProcedures('जन्म दर्ता')
    expect(results.map((r) => r.slug)).toContain('birth-registration')
  })

  it('finds birth registration by romanised query', async () => {
    const results = await searchProcedures('janma darta')
    expect(results.map((r) => r.slug)).toContain('birth-registration')
  })

  it('tolerates a misspelling', async () => {
    const results = await searchProcedures('pasport')
    expect(results.map((r) => r.slug)).toContain('e-passport')
  })

  it('never returns unpublished procedures', async () => {
    // "PAN" is seeded but unpublished, because its requirements are unverified.
    const results = await searchProcedures('pan card')
    expect(results.map((r) => r.slug)).not.toContain('pan-registration')
  })

  it('returns nothing for an empty query', async () => {
    expect(await searchProcedures('   ')).toEqual([])
  })

  it('returns nothing for a query with no plausible match', async () => {
    expect(await searchProcedures('zzzqqqxxyy')).toEqual([])
  })

  it('respects the limit', async () => {
    const results = await searchProcedures('a', { limit: 2 })
    expect(results.length).toBeLessThanOrEqual(2)
  })
})
