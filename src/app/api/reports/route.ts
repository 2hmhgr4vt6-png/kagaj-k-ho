import { NextResponse } from 'next/server'
import { z } from 'zod'
import { ReportReason } from '@prisma/client'
import { prisma } from '@/lib/db/client'
import { clientIpFrom, hashClientIdentifier, rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  procedureSlug: z.string().min(1).max(200),
  reason: z.nativeEnum(ReportReason),
  message: z.string().max(2000).optional().default(''),
  contactEmail: z.string().email().max(254).or(z.literal('')).optional(),
})

/**
 * Public "report outdated information" endpoint.
 *
 * Rate-limited, schema-validated, and deliberately narrow: the only free-text
 * field is capped and no identity fields exist at all. Zod strips unknown keys,
 * so a caller cannot smuggle extra columns into the insert.
 */
export async function POST(request: Request) {
  const ip = clientIpFrom(request.headers)
  const limited = rateLimit(`report:${ip ?? 'anonymous'}`, {
    limit: 5,
    windowMs: 10 * 60_000,
  })
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

  const procedure = await prisma.procedure.findUnique({
    where: { slug: parsed.data.procedureSlug },
    select: { id: true },
  })
  if (!procedure) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  await prisma.report.create({
    data: {
      procedureId: procedure.id,
      reason: parsed.data.reason,
      message: parsed.data.message?.trim() || null,
      contactEmail: parsed.data.contactEmail?.trim() || null,
      submitterHash: hashClientIdentifier(ip),
    },
  })

  return NextResponse.json({ ok: true }, { status: 201 })
}
