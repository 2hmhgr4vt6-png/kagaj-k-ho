/**
 * Source URL health check.
 *
 * Fetches every recorded official source, stores the HTTP status and a hash of
 * the page text, and flags the ones that changed since the last snapshot. A
 * changed hash does not mean the content is wrong — it means an editor should
 * re-read the page. Run it on a schedule (cron / GitHub Action).
 *
 *   npm run check:sources
 */

import { createHash } from 'node:crypto'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TIMEOUT_MS = 20_000
/** Be a polite client: identify ourselves and never hammer an agency site. */
const USER_AGENT =
  'KagajKHoBot/0.1 (+https://kagajkho.example; source verification; contact: admin@example.com)'
const DELAY_MS = 1_500

async function main() {
  const sources = await prisma.officialSource.findMany({
    orderBy: { checkedAt: 'asc' },
    include: { procedure: { select: { slug: true } } },
  })

  let ok = 0
  let failed = 0
  let changed = 0

  for (const source of sources) {
    const result = await fetchSource(source.url)

    await prisma.officialSource.update({
      where: { id: source.id },
      data: { lastHttpStatus: result.status },
    })

    if (result.status >= 400 || result.status === 0) {
      failed += 1
      console.log(`✕ ${result.status || 'ERR'}  ${source.url}`)
    } else {
      ok += 1
      const previous = await prisma.sourceSnapshot.findFirst({
        where: { sourceId: source.id },
        orderBy: { capturedAt: 'desc' },
        select: { contentHash: true },
      })

      if (result.hash && previous?.contentHash !== result.hash) {
        if (previous) {
          changed += 1
          console.log(`~ CHANGED  ${source.url}  (${source.procedure?.slug ?? 'unlinked'})`)
        }
        await prisma.sourceSnapshot.create({
          data: {
            sourceId: source.id,
            contentHash: result.hash,
            excerpt: result.excerpt,
            httpStatus: result.status,
          },
        })
      } else {
        console.log(`✓ ${result.status}  ${source.url}`)
      }
    }

    await sleep(DELAY_MS)
  }

  console.log(`\n${ok} reachable, ${failed} failing, ${changed} changed since last snapshot.`)
  if (changed > 0) {
    console.log('Changed sources need an editorial re-check — see /admin/outdated.')
  }
}

async function fetchSource(url: string) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'user-agent': USER_AGENT, accept: 'text/html,*/*' },
      redirect: 'follow',
    })

    if (!response.ok) return { status: response.status, hash: null, excerpt: null }

    const html = await response.text()
    const text = extractText(html)
    return {
      status: response.status,
      hash: createHash('sha256').update(text).digest('hex'),
      // A bounded excerpt only — we store evidence of drift, not a copy of the page.
      excerpt: text.slice(0, 1000),
    }
  } catch {
    return { status: 0, hash: null, excerpt: null }
  } finally {
    clearTimeout(timer)
  }
}

/** Strips scripts, styles and tags, then normalizes whitespace. */
function extractText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
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
