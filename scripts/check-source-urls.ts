/**
 * Source drift detection.
 *
 * Fetches every recorded official source, extracts its MAIN CONTENT REGION
 * (see src/lib/sources/extract.ts for why the whole page is the wrong thing to
 * hash), stores the hash, and reports which pages changed since the last
 * snapshot. A changed hash does not mean the content is wrong — it means an
 * editor should re-read the page.
 *
 * Outcomes:
 *   ✓ ok        content read and hashed; unchanged since the last snapshot
 *   ~ changed   the main content region differs — needs an editorial re-check
 *   ? thin      served, but the main region is empty (client-rendered page).
 *               The hash proves nothing; this is reported separately precisely
 *               so it is never mistaken for "unchanged".
 *   ✕ failed    4xx/5xx, DNS failure, timeout or reset
 *
 *   npm run check:sources
 */

import { PrismaClient, SourceCheckOutcome } from '@prisma/client'
import { extractMainText } from '../src/lib/sources/extract'

const prisma = new PrismaClient()

const TIMEOUT_MS = 20_000
/** Be a polite client: identify ourselves and never hammer an agency site. */
const USER_AGENT =
  'KagajKHoBot/0.1 (+https://kagajkho.example; source verification; contact: admin@example.com)'
const DELAY_MS = 1_500
/** Bounded excerpt: we store evidence of drift, not a copy of the page. */
const EXCERPT_LIMIT = 1_000

type FetchResult =
  | {
      kind: 'ok'
      status: number
      contentHash: string
      excerpt: string
      mainTextLength: number
      documentTextLength: number
      extractedVia: string
      thin: boolean
    }
  | { kind: 'http_error'; status: number }
  | { kind: 'unreachable'; reason: string }

async function main() {
  const sources = await prisma.officialSource.findMany({
    orderBy: { checkedAt: 'asc' },
    include: { procedure: { select: { slug: true } } },
  })

  let ok = 0
  let changed = 0
  let thin = 0
  let failed = 0

  for (const source of sources) {
    const label = `${source.url}${source.procedure ? `  (${source.procedure.slug})` : ''}`
    const result = await fetchSource(source.url)

    if (result.kind !== 'ok') {
      failed += 1
      const outcome =
        result.kind === 'http_error'
          ? SourceCheckOutcome.HTTP_ERROR
          : SourceCheckOutcome.UNREACHABLE
      await prisma.officialSource.update({
        where: { id: source.id },
        data: {
          lastHttpStatus: result.kind === 'http_error' ? result.status : null,
          lastCheckOutcome: outcome,
          lastCheckedAt: new Date(),
        },
      })
      console.log(
        `✕ ${result.kind === 'http_error' ? result.status : result.reason}  ${label}`,
      )
      await sleep(DELAY_MS)
      continue
    }

    const previous = await prisma.sourceSnapshot.findFirst({
      where: { sourceId: source.id },
      orderBy: { capturedAt: 'desc' },
      select: { contentHash: true, mainTextLength: true },
    })

    await prisma.officialSource.update({
      where: { id: source.id },
      data: {
        lastHttpStatus: result.status,
        lastCheckOutcome: result.thin
          ? SourceCheckOutcome.THIN_CONTENT
          : SourceCheckOutcome.OK,
        lastCheckedAt: new Date(),
      },
    })

    if (result.thin) {
      thin += 1
      console.log(
        `? THIN     ${label}\n           main region is ${result.mainTextLength} chars ` +
          `(document has ${result.documentTextLength}) — page is likely client-rendered, ` +
          `so the hash cannot prove the content is unchanged.`,
      )
    } else if (!previous) {
      ok += 1
      console.log(`✓ ${result.status} first snapshot  ${label}`)
    } else if (previous.contentHash !== result.contentHash) {
      changed += 1
      const before = previous.mainTextLength
      const delta =
        before != null ? ` (${before} → ${result.mainTextLength} chars)` : ''
      console.log(`~ CHANGED  ${label}${delta}`)
    } else {
      ok += 1
      console.log(`✓ ${result.status}  ${label}`)
    }

    // Snapshot only meaningful extractions: storing a shell hash would make
    // the next run report "unchanged" and hide the problem.
    if (!result.thin && previous?.contentHash !== result.contentHash) {
      await prisma.sourceSnapshot.create({
        data: {
          sourceId: source.id,
          contentHash: result.contentHash,
          excerpt: result.excerpt,
          httpStatus: result.status,
          mainTextLength: result.mainTextLength,
          extractedVia: result.extractedVia,
        },
      })
    }

    await sleep(DELAY_MS)
  }

  console.log(
    `\n${ok} unchanged, ${changed} changed, ${thin} unreadable (thin), ${failed} failing.`,
  )
  if (changed > 0 || thin > 0 || failed > 0) {
    console.log('Items needing an editor are listed at /admin/outdated.')
  }
}

async function fetchSource(url: string): Promise<FetchResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'user-agent': USER_AGENT, accept: 'text/html,*/*' },
      redirect: 'follow',
    })

    if (!response.ok) return { kind: 'http_error', status: response.status }

    const extraction = extractMainText(await response.text())
    return {
      kind: 'ok',
      status: response.status,
      contentHash: extraction.contentHash,
      excerpt: extraction.text.slice(0, EXCERPT_LIMIT),
      mainTextLength: extraction.mainTextLength,
      documentTextLength: extraction.documentTextLength,
      extractedVia: extraction.usedSelector,
      thin: extraction.outcome === 'THIN_CONTENT',
    }
  } catch (error) {
    return {
      kind: 'unreachable',
      reason: error instanceof Error ? error.name : 'ERR',
    }
  } finally {
    clearTimeout(timer)
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
