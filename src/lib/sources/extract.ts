import { createHash } from 'node:crypto'
import * as cheerio from 'cheerio'

/**
 * Content extraction for source drift detection.
 *
 * The naive approach — strip every tag and hash the result — fails in both
 * directions against real Nepali government sites, and both failures were
 * observed while building this:
 *
 *   Over-sensitive. The hash covers site-wide chrome (footer link lists,
 *   contact blocks, rotating notice sidebars). A ministry changing an unrelated
 *   notice marks every source on that domain as "changed", and editors quickly
 *   learn to ignore the alerts.
 *
 *   Under-sensitive, which is the dangerous one. Several agency pages render
 *   their body client-side; the served HTML carries only a shell. The hash then
 *   covers the shell forever, so the published requirements can change without
 *   the detector noticing — a stale page keeps looking freshly checked.
 *
 * A page-size or text-length heuristic does not separate these: the Inland
 * Revenue Department's PAN page has an EMPTY body but extracts ~4,300
 * characters of chrome, while the Department of Passports fee page — which
 * carries the real fee table — extracts only ~1,900. So we locate the main
 * content region first, and judge emptiness on that region alone.
 */

/** Structural elements that are never the page's subject matter. */
const CHROME_TAGS = [
  'script', 'style', 'noscript', 'template', 'svg', 'iframe',
  'nav', 'header', 'footer', 'aside', 'form', 'button', 'select',
]

/**
 * Class/id fragments that mark a block as chrome. Deliberately conservative:
 * a false positive here silently removes real content, which is worse than
 * leaving some navigation in the hash.
 */
const CHROME_PATTERN =
  /(^|[-_ ])(nav|navbar|menu|header|footer|sidebar|side-bar|breadcrumb|social|share|widget|banner|carousel|slider|cookie|newsletter|related|popup|modal|offcanvas|topbar|searchbar|pagination|skip)([-_ ]|$)/i

/** Containers most likely to hold the page's subject matter, best first. */
const MAIN_SELECTORS = [
  'main',
  '[role="main"]',
  'article',
  '.entry-content',
  '.post-content',
  '.page-content',
  '.detail__page-inner-content',
  '.detail__page-desc',
  '#content',
  '.content',
]

export type ExtractionOutcome =
  /** A usable main region was found and hashed. */
  | 'OK'
  /**
   * A main region was located but is effectively empty — almost always a
   * client-rendered page. The hash is not meaningful and must not be treated
   * as evidence that the content is unchanged.
   */
  | 'THIN_CONTENT'

export type Extraction = {
  text: string
  contentHash: string
  outcome: ExtractionOutcome
  /** Characters of text in the chosen main region. */
  mainTextLength: number
  /**
   * Characters of text in the raw document, before chrome removal. Compared
   * against `mainTextLength` this is what exposes a client-rendered page: a
   * large document whose content region is empty.
   */
  documentTextLength: number
  /** Which selector matched, or 'body' when nothing more specific did. */
  usedSelector: string
}

/**
 * Below this many characters, a main content region is treated as empty.
 *
 * Calibrated against measured pages in this corpus rather than guessed:
 *   115  Inland Revenue Department PAN page — a shell: title and date only
 *    75  DoNIDCR regulations page — a document-download stub
 *   470  Department of Passports fee page — a real, terse fee table
 *   870+ DoNIDCR FAQ pages — real prose
 *
 * The gap between a shell (≤115) and the shortest real content (470) is wide,
 * so 150 sits safely between them. Misclassification is asymmetric and this
 * errs the safe way: a false THIN merely asks a human to re-read a page, while
 * a false OK lets a stale page keep looking freshly checked.
 */
const THIN_CONTENT_THRESHOLD = 150

export function extractMainText(html: string): Extraction {
  const $ = cheerio.load(html)

  // Measured before anything is stripped: a shell page can carry thousands of
  // characters of chrome, and the gap against the main region is the signal.
  const documentText = normalize($('body').text())

  $(CHROME_TAGS.join(',')).remove()
  $('[class], [id]').each((_, element) => {
    const node = $(element)
    const tokens = `${node.attr('class') ?? ''} ${node.attr('id') ?? ''}`
    if (CHROME_PATTERN.test(tokens)) node.remove()
  })

  const cleanedBodyText = normalize($('body').text())

  let usedSelector = 'body'
  let best = ''
  for (const selector of MAIN_SELECTORS) {
    const candidate = normalize($(selector).first().text())
    // First selector that yields real content wins; MAIN_SELECTORS is ordered
    // from most to least semantically reliable.
    if (candidate.length > best.length) {
      best = candidate
      usedSelector = selector
      if (candidate.length >= THIN_CONTENT_THRESHOLD) break
    }
  }

  if (!best) {
    best = cleanedBodyText
    usedSelector = 'body'
  }

  return {
    text: best,
    contentHash: hashText(best),
    outcome: best.length < THIN_CONTENT_THRESHOLD ? 'THIN_CONTENT' : 'OK',
    mainTextLength: best.length,
    documentTextLength: documentText.length,
    usedSelector,
  }
}

export function hashText(text: string): string {
  return createHash('sha256').update(text).digest('hex')
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}
