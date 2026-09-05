import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/client'
import { isAnalyticsEvent } from '@/lib/analytics/events'
import { clientIpFrom, rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Anonymous analytics sink.
 *
 * The props schema is a strict allow-list: anything the client sends that is
 * not one of these non-identifying fields is dropped before it reaches the
 * database. That is the enforcement point for "no unnecessary personal data".
 */
const propsSchema = z
  .object({
    slug: z.string().max(200).optional(),
    categorySlug: z.string().max(200).optional(),
    resultCount: z.number().int().min(0).max(10_000).optional(),
    zeroResults: z.boolean().optional(),
    locale: z.enum(['ne', 'en']).optional(),
    sourceHost: z.string().max(253).optional(),
    reason: z.string().max(64).optional(),
  })
  .strict()

const bodySchema = z.object({
  name: z.string().max(64).refine(isAnalyticsEvent, 'unknown_event'),
  props: propsSchema.optional().default({}),
})

export async function POST(request: Request) {
  const ip = clientIpFrom(request.headers) ?? 'anonymous'
  const limited = rateLimit(`analytics:${ip}`, { limit: 120, windowMs: 60_000 })
  // Silently accept over-limit events: analytics must never surface an error
  // to a reader, and dropping them is the correct behaviour anyway.
  if (!limited.ok) return NextResponse.json({ ok: true })

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ ok: true })
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: true })

  try {
    await prisma.analyticsEvent.create({
      data: {
        name: parsed.data.name,
        locale: parsed.data.props.locale ?? null,
        props: parsed.data.props,
      },
    })
  } catch {
    // Never fail a beacon.
  }

  return NextResponse.json({ ok: true })
}
