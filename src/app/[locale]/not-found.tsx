import Link from 'next/link'

export default function LocaleNotFound() {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <p className="text-5xl font-bold text-brand-700">404</p>
      <h1 className="mt-4 text-2xl font-bold text-ink">
        पृष्ठ भेटिएन / Page not found
      </h1>
      <p className="mt-2 text-ink-muted">
        तपाईंले खोज्नुभएको पृष्ठ छैन वा सारिएको छ।
        <br />
        The page you were looking for does not exist or has moved.
      </p>
      <Link
        href="/ne"
        className="mt-6 inline-block rounded-lg bg-brand-700 px-5 py-2.5 font-medium text-white"
      >
        गृहपृष्ठ / Home
      </Link>
    </div>
  )
}
