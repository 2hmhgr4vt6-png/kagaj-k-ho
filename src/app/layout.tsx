import type { ReactNode } from 'react'
import './globals.css'

/**
 * Root layout. The real `<html>`/`<body>` live here, but `lang` and `dir` are
 * set per-locale by the [locale] layout via the returned metadata — Next needs
 * a single root layout, and locale is only known one level down, so the
 * attribute is patched there with a nested provider-free approach.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children
}
