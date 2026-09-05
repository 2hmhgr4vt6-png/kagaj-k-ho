/**
 * Search normalization for a bilingual Nepali/English corpus.
 *
 * Real users type any of: "passport", "राहदानी", "rahadani", "passport banaune",
 * "पासपोर्ट". We handle that by building one normalized `searchText` blob per
 * procedure that contains the Nepali title, the English title, hand-curated
 * aliases, and a mechanical Devanagari->Latin transliteration of the Nepali
 * title. Matching is then trigram similarity over that blob.
 */

/** Devanagari -> Latin. Deliberately lossy: it targets how people actually
 *  type Nepali words in Latin script, not scholarly ISO 15919. */
const DEVANAGARI_TO_LATIN: Array<[string, string]> = [
  // Conjunct/compound forms first so they win over their components.
  ['क्ष', 'chh'], ['त्र', 'tra'], ['ज्ञ', 'gya'], ['श्र', 'shra'],
  // Consonants
  ['क', 'k'], ['ख', 'kh'], ['ग', 'g'], ['घ', 'gh'], ['ङ', 'n'],
  ['च', 'ch'], ['छ', 'chh'], ['ज', 'j'], ['झ', 'jh'], ['ञ', 'n'],
  ['ट', 't'], ['ठ', 'th'], ['ड', 'd'], ['ढ', 'dh'], ['ण', 'n'],
  ['त', 't'], ['थ', 'th'], ['द', 'd'], ['ध', 'dh'], ['न', 'n'],
  ['प', 'p'], ['फ', 'ph'], ['ब', 'b'], ['भ', 'bh'], ['म', 'm'],
  ['य', 'y'], ['र', 'r'], ['ल', 'l'], ['व', 'w'],
  ['श', 'sh'], ['ष', 'sh'], ['स', 's'], ['ह', 'h'],
  // Independent vowels
  ['अ', 'a'], ['आ', 'aa'], ['इ', 'i'], ['ई', 'i'], ['उ', 'u'], ['ऊ', 'u'],
  ['ए', 'e'], ['ऐ', 'ai'], ['ओ', 'o'], ['औ', 'au'], ['ऋ', 'ri'],
  // Vowel signs
  ['ा', 'a'], ['ि', 'i'], ['ी', 'i'], ['ु', 'u'], ['ू', 'u'],
  ['े', 'e'], ['ै', 'ai'], ['ो', 'o'], ['ौ', 'au'], ['ृ', 'ri'],
  // Marks
  ['ं', 'n'], ['ँ', 'n'], ['ः', 'h'], ['़', ''],
  // Halant removes the inherent vowel; we simply drop it.
  ['्', ''],
  // Digits
  ['०', '0'], ['१', '1'], ['२', '2'], ['३', '3'], ['४', '4'],
  ['५', '5'], ['६', '6'], ['७', '7'], ['८', '8'], ['९', '9'],
]

// Longest-first so "क्ष" is matched before "क".
const TRANSLITERATION_RULES = [...DEVANAGARI_TO_LATIN].sort(
  (a, b) => b[0].length - a[0].length,
)

export function transliterateDevanagari(input: string): string {
  let out = ''
  let i = 0
  outer: while (i < input.length) {
    for (const [from, to] of TRANSLITERATION_RULES) {
      if (input.startsWith(from, i)) {
        out += to
        i += from.length
        continue outer
      }
    }
    out += input[i]
    i += 1
  }
  return out
}

const DEVANAGARI_RANGE = /[ऀ-ॿ]/

export function hasDevanagari(input: string): boolean {
  return DEVANAGARI_RANGE.test(input)
}

/**
 * Lowercases, strips punctuation and collapses whitespace. Devanagari is left
 * intact (it has no case), so a normalized string may mix both scripts.
 *
 * `\p{M}` is essential: Devanagari vowel signs and the halant are combining
 * marks, not letters. Without it "राहदानी" would be mangled into "र हद न".
 */
export function normalizeQuery(input: string): string {
  return input
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Expands a user query into the variants we search with: the normalized query
 * itself plus, when it contains Devanagari, its Latin transliteration.
 */
export function queryVariants(input: string): string[] {
  const normalized = normalizeQuery(input)
  if (!normalized) return []
  const variants = new Set<string>([normalized])
  if (hasDevanagari(normalized)) {
    variants.add(normalizeQuery(transliterateDevanagari(normalized)))
  }
  return [...variants].filter(Boolean)
}

/**
 * Builds the stored `searchText` blob for a procedure. Kept in sync by
 * `rebuildSearchText` whenever a procedure or its aliases change.
 */
export function buildSearchText(input: {
  titleNe: string
  titleEn: string
  summaryNe?: string | null
  summaryEn?: string | null
  categoryNe?: string | null
  categoryEn?: string | null
  aliases?: string[]
}): string {
  const parts = [
    input.titleNe,
    input.titleEn,
    transliterateDevanagari(input.titleNe),
    input.summaryNe ?? '',
    input.summaryEn ?? '',
    input.categoryNe ?? '',
    input.categoryEn ?? '',
    transliterateDevanagari(input.categoryNe ?? ''),
    ...(input.aliases ?? []),
    ...(input.aliases ?? []).map(transliterateDevanagari),
  ]

  const tokens = new Set<string>()
  for (const part of parts) {
    const normalized = normalizeQuery(part)
    if (normalized) tokens.add(normalized)
  }
  return [...tokens].join(' ')
}
