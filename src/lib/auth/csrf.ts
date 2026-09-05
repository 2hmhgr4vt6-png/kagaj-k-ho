import 'server-only'
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { requireServerSecret } from '@/lib/env'

/**
 * Stateless double-submit CSRF tokens for admin forms.
 *
 * Next.js Server Actions already carry origin checks, but the admin panel also
 * exposes plain POST routes, so those get an explicit token. The token is
 * `nonce.hmac(nonce)` — no server-side storage needed.
 */
export function issueCsrfToken(): string {
  const nonce = randomBytes(16).toString('hex')
  return `${nonce}.${sign(nonce)}`
}

export function verifyCsrfToken(token: string | null | undefined): boolean {
  if (!token) return false
  const [nonce, signature] = token.split('.')
  if (!nonce || !signature) return false

  const expected = Buffer.from(sign(nonce))
  const provided = Buffer.from(signature)
  if (expected.length !== provided.length) return false
  return timingSafeEqual(expected, provided)
}

function sign(nonce: string): string {
  return createHmac('sha256', requireServerSecret('ADMIN_SESSION_SECRET'))
    .update(nonce)
    .digest('hex')
}
