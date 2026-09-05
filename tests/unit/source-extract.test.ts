import { describe, expect, it } from 'vitest'
import { extractMainText, hashText } from '@/lib/sources/extract'

/**
 * These fixtures reproduce the two real structures that broke the naive
 * "strip all tags and hash" approach on Nepali government sites.
 */

/** A page whose real content sits in a main region, surrounded by heavy chrome. */
const RICH_PAGE = `
<!doctype html><html><body>
  <header class="site-header"><a href="/">राहदानी विभाग</a></header>
  <nav class="navbar"><a href="/a">क</a><a href="/b">ख</a></nav>
  <div class="content">
    <h1>राहदानीका लागि लाग्ने दस्तुर</h1>
    <table>
      <tr><td>नयाँ (New)/नवीकरण (Renew)</td><td>३४</td><td>रू. १२,०००/-</td></tr>
      <tr><td>नयाँ (New)/नवीकरण (Renew)</td><td>६६</td><td>रू. २०,०००/-</td></tr>
      <tr><td>कार्यालयको गल्ती (Official Error)</td><td>३४</td><td>निःशुल्क</td></tr>
    </table>
    <p>यी दर सामान्यतया लागू हुन्छन्। कार्यालय जानुअघि पछिल्लो सूचना हेर्नुहोस्।</p>
  </div>
  <aside class="sidebar related"><h2>सम्बन्धित सूचना</h2><p>Sealed Quotation No: IRD/SQ/G/2083-84/03</p></aside>
  <footer class="site-footer"><p>उपयोगी लिंकहरु</p><p>सम्पर्क: 01-5970330</p></footer>
</body></html>`

/**
 * The same page after the agency edits an unrelated footer number and rotates
 * the notices sidebar. The subject matter is byte-identical.
 */
const RICH_PAGE_CHROME_CHANGED = RICH_PAGE
  .replace('01-5970330', '01-5970331')
  .replace('Sealed Quotation No: IRD/SQ/G/2083-84/03', 'AML-CFT Guidance to DPMS')

/** The same page after the fee itself changes. */
const RICH_PAGE_CONTENT_CHANGED = RICH_PAGE.replace('रू. १२,०००/-', 'रू. १३,०००/-')

/**
 * A client-rendered page: the shell carries a title and a date, the body is
 * injected by JavaScript. Its chrome is verbose, so the *document* has plenty
 * of text even though the subject matter is absent — this is why a page-length
 * heuristic does not work.
 */
const THIN_PAGE = `
<!doctype html><html><body>
  <header class="site-header"><a href="/">आन्तरिक राजस्व विभाग</a></header>
  <nav class="navbar"><a href="/x">कर</a><a href="/y">फारमहरु</a><a href="/z">सूचना</a></nav>
  <main>
    <h1>व्यक्तिगत स्थायी लेखा नम्बरको लागि दर्ता प्रक्रिया</h1>
    <span>१४ असोज, २०७७</span>
    <div class="detail-body"></div>
  </main>
  <aside class="sidebar related">
    <h2>सम्बन्धित सूचना</h2>
    <p>प्रधानमन्त्री दैवी प्रकोप उद्धार कोष र प्रधानमन्त्री राहत कोषमा आर्थिक सहयोग गरिदिनु हुन सबैमा हार्दिक अपिल</p>
    <p>गैरबासिन्दा व्यक्तिले प्रदान गर्ने विद्युतीय सेवामा मूल्य अभिवृद्धि कर सम्बन्धी कार्यविधि, २०७९ को स्पष्टताको लागि जारी गरिएको सूचना</p>
    <p>आर्थिक ऐन २०८३ बमोजिमका छुट कार्यान्वयन सम्बन्धी स्वीकृत निवेदनका फारमहरु।</p>
  </aside>
  <footer class="site-footer"><p>उपयोगी लिंकहरु</p><p>सम्पर्क</p></footer>
</body></html>`

describe('extractMainText', () => {
  it('keeps the subject matter of a content page', () => {
    const result = extractMainText(RICH_PAGE)
    expect(result.outcome).toBe('OK')
    expect(result.text).toContain('रू. १२,०००/-')
    expect(result.text).toContain('निःशुल्क')
  })

  it('excludes navigation, sidebars and footers from the hashed text', () => {
    const result = extractMainText(RICH_PAGE)
    expect(result.text).not.toContain('उपयोगी लिंकहरु')
    expect(result.text).not.toContain('सम्पर्क')
    expect(result.text).not.toContain('Sealed Quotation')
  })

  it('does not report drift when only chrome changes', () => {
    // The failure this prevents: one unrelated ministry notice marking every
    // source on the domain as changed, until editors stop reading the alerts.
    const before = extractMainText(RICH_PAGE)
    const after = extractMainText(RICH_PAGE_CHROME_CHANGED)
    expect(after.contentHash).toBe(before.contentHash)
  })

  it('does report drift when the subject matter changes', () => {
    const before = extractMainText(RICH_PAGE)
    const after = extractMainText(RICH_PAGE_CONTENT_CHANGED)
    expect(after.contentHash).not.toBe(before.contentHash)
  })

  it('flags a client-rendered page as THIN_CONTENT', () => {
    // The dangerous failure: hashing a shell forever, so a stale page keeps
    // looking freshly checked.
    const result = extractMainText(THIN_PAGE)
    expect(result.outcome).toBe('THIN_CONTENT')
  })

  it('does not rely on document length to detect thin content', () => {
    // The empty-bodied page carries MORE total text than the real content page,
    // because its chrome is verbose. Only the main region separates them.
    const thin = extractMainText(THIN_PAGE)
    const rich = extractMainText(RICH_PAGE)
    expect(thin.documentTextLength).toBeGreaterThan(rich.mainTextLength)
    expect(thin.mainTextLength).toBeLessThan(rich.mainTextLength)
  })

  it('falls back to the body when no main container matches', () => {
    const html = `<!doctype html><html><body><div><p>${'क'.repeat(400)}</p></div></body></html>`
    const result = extractMainText(html)
    expect(result.usedSelector).toBe('body')
    expect(result.outcome).toBe('OK')
  })

  it('normalizes whitespace so reformatting alone is not drift', () => {
    const spaced = RICH_PAGE.replace(/\n/g, '\n\n   ')
    expect(extractMainText(spaced).contentHash).toBe(extractMainText(RICH_PAGE).contentHash)
  })

  it('handles empty and malformed input without throwing', () => {
    expect(extractMainText('').outcome).toBe('THIN_CONTENT')
    expect(extractMainText('<html><body><div>unclosed').outcome).toBe('THIN_CONTENT')
  })
})

describe('hashText', () => {
  it('is stable and differs on different input', () => {
    expect(hashText('क')).toBe(hashText('क'))
    expect(hashText('क')).not.toBe(hashText('ख'))
  })
})
