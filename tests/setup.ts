/**
 * Test environment defaults.
 *
 * `server-only` is imported by several modules under test; in a plain Node
 * test runner there is no React Server Component boundary, so it is stubbed.
 */
import { vi } from 'vitest'

vi.mock('server-only', () => ({}))

process.env.ADMIN_SESSION_SECRET ??=
  'test-secret-that-is-definitely-long-enough-0123456789'
process.env.NEXT_PUBLIC_SITE_URL ??= 'http://localhost:3000'
