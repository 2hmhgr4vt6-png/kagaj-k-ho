import Link from 'next/link'
import './globals.css'

/**
 * Root-level 404. Unlike the locale-scoped one, this renders its own document
 * because no locale layout applies — an unmatched top-level path has no locale.
 */
export default function RootNotFound() {
  return (
    <html lang="ne">
      <body className="grid min-h-screen place-items-center bg-slate-50 p-6 text-center">
        <div>
          <p className="text-5xl font-bold text-brand-700">404</p>
          <h1 className="mt-4 text-2xl font-bold text-ink">
            पृष्ठ भेटिएन / Page not found
          </h1>
          <Link
            href="/ne"
            className="mt-6 inline-block rounded-lg bg-brand-700 px-5 py-2.5 font-medium text-white"
          >
            गृहपृष्ठ / Home
          </Link>
        </div>
      </body>
    </html>
  )
}
