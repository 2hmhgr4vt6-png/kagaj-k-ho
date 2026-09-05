import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

/**
 * Two jobs:
 *  1. Redirect locale-less paths to the default locale.
 *  2. Gate /admin behind a valid session cookie.
 *
 * The admin check here only verifies the JWT signature — it cannot query the
 * database from the edge runtime. Every admin page and action re-checks the
 * account server-side (see lib/auth/session.ts), so a deactivated admin is
 * still rejected; this layer just avoids rendering the shell for anonymous
 * visitors.
 */

const COOKIE_NAME = 'kkh_admin_session'
const LOCALES = ['ne', 'en']
const DEFAULT_LOCALE = 'ne'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next()

    const token = request.cookies.get(COOKIE_NAME)?.value
    const secret = process.env.ADMIN_SESSION_SECRET
    if (!token || !secret) return redirectToLogin(request)

    try {
      await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ['HS256'] })
      return NextResponse.next()
    } catch {
      return redirectToLogin(request)
    }
  }

  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  )
  if (!hasLocale) {
    const url = request.nextUrl.clone()
    url.pathname = `/${preferredLocale(request)}${pathname === '/' ? '' : pathname}`
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone()
  url.pathname = '/admin/login'
  url.search = ''
  return NextResponse.redirect(url)
}

/** Honours Accept-Language, but defaults to Nepali — this is a Nepali-first site. */
function preferredLocale(request: NextRequest): string {
  const header = request.headers.get('accept-language') ?? ''
  return /\ben\b/i.test(header) && !/\bne\b/i.test(header) ? 'en' : DEFAULT_LOCALE
}

export const config = {
  matcher: [
    // Everything except Next internals, the API, and static assets.
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)',
  ],
}
