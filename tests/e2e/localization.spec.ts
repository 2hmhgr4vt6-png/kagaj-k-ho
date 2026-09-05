import { expect, test } from '@playwright/test'

test.describe('localization', () => {
  test('the root path redirects into a locale', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/(ne|en)$/)
  })

  test('the Nepali homepage shows the Nepali headline', async ({ page }) => {
    await page.goto('/ne')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'सरकारी काम गर्न के के कागज चाहिन्छ?',
    )
    await expect(page.locator('html')).toHaveAttribute('lang', 'ne-NP')
  })

  test('switching language keeps you on the same page', async ({ page }) => {
    await page.goto('/ne/services/e-passport')
    await page.getByRole('link', { name: 'English' }).click()
    await expect(page).toHaveURL(/\/en\/services\/e-passport/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  })

  test('the disclaimer appears on every page in both languages', async ({ page }) => {
    await page.goto('/ne')
    await expect(page.getByText('कागज के हो? एक स्वतन्त्र सूचना प्लेटफर्म हो।').first()).toBeVisible()

    await page.goto('/en')
    await expect(
      page.getByText('Kagaj K Ho? is an independent information platform.').first(),
    ).toBeVisible()
  })

  test('procedure pages carry a canonical URL and hreflang alternates', async ({ page }) => {
    await page.goto('/en/services/e-passport')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      /\/en\/services\/e-passport$/,
    )
    await expect(page.locator('link[rel="alternate"][hreflang="ne"]')).toHaveCount(1)
  })

  test('procedure pages emit HowTo structured data', async ({ page }) => {
    await page.goto('/en/services/e-passport')
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents()
    const types = scripts.map((raw) => JSON.parse(raw)['@type'])
    expect(types).toContain('HowTo')
    expect(types).toContain('BreadcrumbList')
    // We publish Organization, never GovernmentOrganization.
    expect(types).not.toContain('GovernmentOrganization')
  })
})
