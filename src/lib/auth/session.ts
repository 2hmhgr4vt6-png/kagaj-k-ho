import 'server-only'
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { AdminRole } from '@prisma/client'
import { prisma } from '@/lib/db/client'
import { requireServerSecret } from '@/lib/env'

const COOKIE_NAME = 'kkh_admin_session'
const SESSION_TTL_SECONDS = 60 * 60 * 8 // 8 hours

export type AdminSession = {
  adminId: string
  email: string
  name: string
  role: AdminRole
}

function secretKey(): Uint8Array {
  return new TextEncoder().encode(requireServerSecret('ADMIN_SESSION_SECRET'))
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12)
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

export async function createSession(session: AdminSession): Promise<void> {
  const token = await new SignJWT({ ...session })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .setSubject(session.adminId)
    .sign(secretKey())

  const store = await cookies()
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  })
}

export async function destroySession(): Promise<void> {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}

export async function getSession(): Promise<AdminSession | null> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ['HS256'] })
    const adminId = payload.sub
    if (typeof adminId !== 'string') return null

    // Re-read the admin so a deactivated account loses access immediately
    // rather than at token expiry.
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    })
    if (!admin || !admin.isActive) return null

    return { adminId: admin.id, email: admin.email, name: admin.name, role: admin.role }
  } catch {
    return null
  }
}

const ROLE_RANK: Record<AdminRole, number> = {
  [AdminRole.VIEWER]: 0,
  [AdminRole.CONTRIBUTOR]: 1,
  [AdminRole.EDITOR]: 2,
  [AdminRole.OWNER]: 3,
}

export function hasRole(session: AdminSession | null, minimum: AdminRole): boolean {
  if (!session) return false
  return ROLE_RANK[session.role] >= ROLE_RANK[minimum]
}

/** Throws unless the caller is signed in with at least `minimum`. */
export async function requireRole(minimum: AdminRole): Promise<AdminSession> {
  const session = await getSession()
  if (!hasRole(session, minimum)) {
    throw new Error('UNAUTHORIZED')
  }
  return session as AdminSession
}
