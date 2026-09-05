/**
 * Environment access. Secrets are read lazily and never re-exported to the
 * client bundle — only NEXT_PUBLIC_* values are safe to reference in components.
 */

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
).replace(/\/+$/, '')

export const analyticsEnabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true'

export function requireServerSecret(name: 'ADMIN_SESSION_SECRET'): string {
  const value = process.env[name]
  if (!value || value.length < 32) {
    throw new Error(
      `${name} is missing or too short (need >= 32 chars). See .env.example.`,
    )
  }
  return value
}

export function optionalServerSecret(name: string): string | undefined {
  const value = process.env[name]
  return value && value.length > 0 ? value : undefined
}
