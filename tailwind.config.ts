import type { Config } from 'tailwindcss'

/**
 * Visual identity: independent, modern, trustworthy. Deliberately NOT the
 * red/blue of Nepal's government seals — we must never look like an official
 * government site. Deep indigo + a warm "sindoor-adjacent" accent instead.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        ink: {
          DEFAULT: '#111827',
          muted: '#4b5563',
          faint: '#6b7280',
        },
        verified: '#15803d',
        pending: '#b45309',
        unavailable: '#b91c1c',
      },
      fontFamily: {
        sans: ['var(--font-ui)', 'system-ui', 'sans-serif'],
        nepali: ['var(--font-nepali)', 'Mukta', 'Kalimati', 'Noto Sans Devanagari', 'sans-serif'],
      },
      maxWidth: { content: '72rem' },
      borderRadius: { xl2: '1rem' },
    },
  },
  plugins: [],
}

export default config
