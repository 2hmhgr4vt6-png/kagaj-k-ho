import { NextResponse } from 'next/server'
import { z } from 'zod'
import { searchProcedures } from '@/lib/search/search'
import { getPublishedProcedure } from '@/lib/content/queries'
import { clientIpFrom, rateLimit } from '@/lib/rate-limit'
import { isLocale, defaultLocale } from '@/lib/i18n/config'
import { answerFromVerifiedContent } from '@/lib/ai/answer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  question: z.string().min(2).max(500),
  locale: z.string().optional(),
})

/**
 * AI assistant endpoint.
 *
 * Architecturally, the model is never the source of truth: this route resolves
 * the question to a *published* procedure via the same search index the site
 * uses, then answers strictly from that record's stored fields. If nothing
 * matches, it says so and points at the official portal rather than guessing.
 */
export async function POST(request: Request) {
  const ip = clientIpFrom(request.headers) ?? 'anonymous'
  const limited = rateLimit(`ai:${ip}`, { limit: 20, windowMs: 60_000 })
  if (!limited.ok) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 })
  }

  const locale =
    parsed.data.locale && isLocale(parsed.data.locale) ? parsed.data.locale : defaultLocale

  const hits = await searchProcedures(parsed.data.question, { limit: 1 })
  const procedure = hits[0] ? await getPublishedProcedure(hits[0].slug) : null

  return NextResponse.json(answerFromVerifiedContent(procedure, locale))
}
