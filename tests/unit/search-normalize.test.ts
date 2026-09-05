import { describe, expect, it } from 'vitest'
import {
  buildSearchText,
  hasDevanagari,
  normalizeQuery,
  queryVariants,
  transliterateDevanagari,
} from '@/lib/search/normalize'

describe('normalizeQuery', () => {
  it('lowercases and collapses whitespace', () => {
    expect(normalizeQuery('  Passport   Renewal  ')).toBe('passport renewal')
  })

  it('strips punctuation but keeps letters, marks and digits', () => {
    expect(normalizeQuery('PAN-card (नयाँ) #2081!')).toBe('pan card नयाँ 2081')
  })

  it('preserves Devanagari vowel signs and the halant', () => {
    // Regression: combining marks are \p{M}, not \p{L}. Stripping them turned
    // "राहदानी" into "र हद न" and broke every Nepali search.
    expect(normalizeQuery('राहदानी')).toBe('राहदानी')
    expect(normalizeQuery('राष्ट्रिय परिचयपत्र')).toBe('राष्ट्रिय परिचयपत्र')
  })

  it('leaves Devanagari intact', () => {
    expect(normalizeQuery('राहदानी')).toBe('राहदानी')
  })

  it('returns an empty string for punctuation-only input', () => {
    expect(normalizeQuery('!!! ???')).toBe('')
  })
})

describe('transliterateDevanagari', () => {
  it('romanises common service names the way people type them', () => {
    // Vowel signs map to short Latin vowels, which is how people actually
    // type these words: राहदानी -> "rahdani", नागरिकता -> "nagrikta".
    expect(transliterateDevanagari('राहदानी')).toBe('rahdani')
    expect(transliterateDevanagari('नागरिकता')).toBe('nagrikta')
  })

  it('prefers longer conjunct rules over their components', () => {
    // क्ष must not be transliterated as "k" + halant + "sh".
    expect(transliterateDevanagari('क्ष')).toBe('chh')
  })

  it('converts Nepali digits', () => {
    expect(transliterateDevanagari('२०८३')).toBe('2083')
  })

  it('passes Latin text through unchanged', () => {
    expect(transliterateDevanagari('passport')).toBe('passport')
  })
})

describe('hasDevanagari', () => {
  it('detects Devanagari', () => {
    expect(hasDevanagari('नागरिकता')).toBe(true)
    expect(hasDevanagari('citizenship')).toBe(false)
  })
})

describe('queryVariants', () => {
  it('adds a transliterated variant for Devanagari input', () => {
    const variants = queryVariants('राहदानी')
    expect(variants).toContain('राहदानी')
    expect(variants).toContain('rahdani')
  })

  it('returns a single variant for Latin input', () => {
    expect(queryVariants('passport')).toEqual(['passport'])
  })

  it('returns nothing for an empty query', () => {
    expect(queryVariants('   ')).toEqual([])
  })
})

describe('buildSearchText', () => {
  const blob = buildSearchText({
    titleNe: 'नेपालभित्रबाट इ-राहदानीको आवेदन',
    titleEn: 'Applying for an e-passport from within Nepal',
    categoryNe: 'राहदानी',
    categoryEn: 'Passport',
    aliases: ['passport banaune', 'पासपोर्ट'],
  })

  it('contains both languages', () => {
    expect(blob).toContain('राहदानी')
    expect(blob).toContain('passport')
  })

  it('contains transliterated forms so romanised queries match', () => {
    expect(blob).toContain('pasport')
  })

  it('contains curated aliases', () => {
    expect(blob).toContain('passport banaune')
  })
})
