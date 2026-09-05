import { createHash } from 'node:crypto'
import { optionalServerSecret } from './env'

/**
 * In-memory fixed-window rate limiter for public forms.
 *
 * Deliberately process-local: it is enough to stop casual abuse of the report
 * form on a single instance. A multi-instance deployment should swap this for
 * Redis/Upstash — the interface is intentionally small enough to do that in one
 * file. See README "Known limitations".
 */
type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

export type RateLimitResult = { ok: boolean; remaining: number; resetAt: number }

export function rateLimit(
  key: string,
  options: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    const bucket = { count: 1, resetAt: now + options.windowMs }
    buckets.set(key, bucket)
    pruneExpired(now)
    return { ok: true, remaining: options.limit - 1, resetAt: bucket.resetAt }
  }

  existing.count += 1
  return {
    ok: existing.count <= options.limit,
    remaining: Math.max(0, options.limit - existing.count),
    resetAt: existing.resetAt,
  }
}

function pruneExpired(now: number): void {
  if (buckets.size < 5_000) return
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

/**
 * One-way, salted, truncated hash of a client IP. Used only to group abusive
 * submissions; it is not reversible and is never shown to anyone.
 */
export function hashClientIdentifier(ip: string | null | undefined): string | null {
  if (!ip) return null
  const salt = optionalServerSecret('ADMIN_SESSION_SECRET') ?? 'kagaj-dev-salt'
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32)
}

/** Best-effort client IP from proxy headers. */
export function clientIpFrom(headers: Headers): string | null {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]!.trim()
  return headers.get('x-real-ip')
}
