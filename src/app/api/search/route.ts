import { NextResponse } from 'next/server'
import { z } from 'zod'
import { suggestProcedures } from '@/lib/search/search'
import { clientIpFrom, rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const querySchema = z.object({
  q: z.string().min(1).max(120),
  limit: z.coerce.number().int().min(1).max(20).default(8),
})

export async function GET(request: Request) {
  const ip = clientIpFrom(request.headers) ?? 'anonymous'
  const limited = rateLimit(`search:${ip}`, { limit: 60, windowMs: 60_000 })
  if (!limited.ok) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  const url = new URL(request.url)
  const parsed = querySchema.safeParse({
    q: url.searchParams.get('q') ?? '',
    limit: url.searchParams.get('limit') ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json({ results: [] })
  }

  const results = await suggestProcedures(parsed.data.q, parsed.data.limit)
  return NextResponse.json(
    { results },
    { headers: { 'cache-control': 'private, max-age=30' } },
  )
}
