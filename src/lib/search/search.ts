import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db/client'
import { queryVariants } from './normalize'

export type SearchHit = {
  id: string
  slug: string
  titleEn: string
  titleNe: string
  summaryEn: string
  summaryNe: string
  categorySlug: string
  categoryNameEn: string
  categoryNameNe: string
  verificationStatus: string
  lastVerifiedAt: Date | null
  score: number
}

/**
 * Ranked search over published procedures.
 *
 * Ranking combines three signals, highest wins:
 *   1.00  exact / prefix hit on the title in either language
 *   0.90  the query appears as a substring of the searchText blob
 *   0..1  trigram similarity against the searchText blob
 *
 * Trigram similarity is what makes Devanagari and misspelled romanisations
 * work; the substring and prefix bonuses stop "PAN" from being buried under
 * fuzzy matches.
 */
export async function searchProcedures(
  rawQuery: string,
  options: { limit?: number } = {},
): Promise<SearchHit[]> {
  const limit = Math.min(Math.max(options.limit ?? 20, 1), 50)
  const variants = queryVariants(rawQuery)
  if (variants.length === 0) return []

  // Trigram similarity is meaningless below 3 characters, so short queries
  // (e.g. "PAN") fall back to prefix/substring matching only.
  const useTrigram = variants.some((v) => v.length >= 3)
  const threshold = useTrigram ? 0.18 : 1.1

  const rows = await prisma.$queryRaw<Array<SearchHit>>(Prisma.sql`
    SELECT
      p.id,
      p.slug,
      p."titleEn",
      p."titleNe",
      p."summaryEn",
      p."summaryNe",
      c.slug              AS "categorySlug",
      c."nameEn"          AS "categoryNameEn",
      c."nameNe"          AS "categoryNameNe",
      p."verificationStatus"::text AS "verificationStatus",
      p."lastVerifiedAt",
      GREATEST(
        MAX(CASE
          WHEN lower(p."titleEn") = v.q OR lower(p."titleNe") = v.q THEN 1.0
          WHEN lower(p."titleEn") LIKE v.q || '%' OR lower(p."titleNe") LIKE v.q || '%' THEN 0.95
          ELSE 0 END),
        MAX(CASE WHEN p."searchText" LIKE '%' || v.q || '%' THEN 0.9 ELSE 0 END),
        MAX(similarity(p."searchText", v.q))
      )::float8 AS score
    FROM "procedures" p
    JOIN "categories" c ON c.id = p."categoryId"
    CROSS JOIN unnest(${variants}::text[]) AS v(q)
    WHERE p.status = 'PUBLISHED'
      AND (
        p."searchText" LIKE '%' || v.q || '%'
        OR similarity(p."searchText", v.q) > ${threshold}
      )
    GROUP BY p.id, c.slug, c."nameEn", c."nameNe"
    ORDER BY score DESC, p."viewCount" DESC, p."titleEn" ASC
    LIMIT ${limit}
  `)

  return rows
}

/** Lightweight autocomplete: same ranking, fewer columns, tighter limit. */
export async function suggestProcedures(rawQuery: string, limit = 8) {
  const hits = await searchProcedures(rawQuery, { limit })
  return hits.map((hit) => ({
    slug: hit.slug,
    titleEn: hit.titleEn,
    titleNe: hit.titleNe,
    categoryNameEn: hit.categoryNameEn,
    categoryNameNe: hit.categoryNameNe,
    verificationStatus: hit.verificationStatus,
  }))
}
