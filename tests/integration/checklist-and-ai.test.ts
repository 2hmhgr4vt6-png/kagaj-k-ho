import { describe, expect, it } from 'vitest'
import { getPublishedProcedure } from '@/lib/content/queries'
import { buildChecklistText } from '@/lib/content/checklist'
import { answerFromVerifiedContent } from '@/lib/ai/answer'

describe('buildChecklistText', () => {
  it('includes documents, steps, sources and the disclaimer', async () => {
    const procedure = await getPublishedProcedure('e-passport')
    const text = buildChecklistText(procedure!, 'en', 'https://example.test')

    expect(text).toContain('Required documents')
    expect(text).toContain('Step-by-step process')
    expect(text).toContain('Official sources')
    expect(text).toContain('nepalpassport.gov.np')
    // A printed checklist leaves the site, so it must carry the disclaimer.
    expect(text).toContain('not a government website')
    expect(text).toContain('https://example.test/en/services/e-passport')
  })

  it('renders in Nepali with the official Nepali document names', async () => {
    const procedure = await getPublishedProcedure('e-passport')
    const text = buildChecklistText(procedure!, 'ne', 'https://example.test')

    expect(text).toContain('आवश्यक कागजातहरू')
    expect(text).toContain('नेपाली नागरिकताको सक्कल प्रमाणपत्र')
  })

  it('labels the basis of any claim that is not officially stated', async () => {
    const procedure = await getPublishedProcedure('e-passport')
    const text = buildChecklistText(procedure!, 'en', 'https://example.test')
    // Optional documents are still marked, so paper readers can tell.
    expect(text).toContain('Only if applicable')
  })
})

describe('answerFromVerifiedContent', () => {
  it('answers only from stored fields and cites the source', async () => {
    const procedure = await getPublishedProcedure('e-passport')
    const answer = answerFromVerifiedContent(procedure!, 'en')

    expect(answer.grounded).toBe(true)
    expect(answer.attribution).toContain('Based on verified information from')
    expect(answer.attribution).toContain('Last verified')
    expect(answer.sources.length).toBeGreaterThan(0)
    expect(answer.answer).toContain('National Identity Card')
  })

  it('never asserts an unverified fee as a number', async () => {
    const procedure = await getPublishedProcedure('e-passport')
    const answer = answerFromVerifiedContent(procedure!, 'en')
    expect(answer.answer).toContain('Fee not verified')
  })

  it('states the officially verified NPR 500 duplicate fee for the national ID', async () => {
    const procedure = await getPublishedProcedure('national-id-card')
    const answer = answerFromVerifiedContent(procedure!, 'en')
    expect(answer.answer).toContain('NPR 500')
  })

  it('refuses to guess when no verified procedure matches', () => {
    const answer = answerFromVerifiedContent(null, 'en')
    expect(answer.grounded).toBe(false)
    expect(answer.answer).toContain("couldn't verify this from an official Nepal government source")
    expect(answer.sources[0]?.url).toBe('https://nepal.gov.np/')
  })

  it('refuses in Nepali too', () => {
    const answer = answerFromVerifiedContent(null, 'ne')
    expect(answer.grounded).toBe(false)
    expect(answer.answer).toContain('आधिकारिक स्रोतबाट अझै प्रमाणित गर्न सकेका छैनौं')
  })
})
