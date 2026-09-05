import { expect, test } from '@playwright/test'

/**
 * The core journey the product exists for:
 * search → procedure page → official source.
 */
test.describe('search → procedure → source', () => {
  test('English search reaches the passport page and its official source', async ({ page }) => {
    await page.goto('/en')

    await page.getByRole('combobox', { name: /what do you need|तपाईंलाई के काम/i }).fill('passport')
    await page.getByRole('button', { name: 'Search' }).click()

    await expect(page).toHaveURL(/\/en\/search\?q=passport/)
    const result = page.getByRole('link', { name: /e-passport/i }).first()
    await expect(result).toBeVisible()
    await result.click()

    await expect(page).toHaveURL(/\/en\/services\/e-passport/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('e-passport')

    // Trust badge and verification date must both be present.
    await expect(page.getByText('Verified from official source').first()).toBeVisible()
    await expect(page.getByText('Last verified').first()).toBeVisible()

    // The official source must be linked, with its URL visible.
    const source = page.getByRole('link', {
      name: /When applying for a passport in Nepal/i,
    })
    await expect(source).toBeVisible()
    await expect(source).toHaveAttribute(
      'href',
      'https://nepalpassport.gov.np/en/process/process-23',
    )
    await expect(source).toHaveAttribute('rel', /noopener/)
  })

  test('Nepali search finds the passport page', async ({ page }) => {
    await page.goto('/ne')

    await page.getByRole('combobox', { name: /what do you need|तपाईंलाई के काम/i }).fill('राहदानी')
    await page.getByRole('button', { name: 'खोज्नुहोस्' }).click()

    await expect(page).toHaveURL(/\/ne\/search/)
    await expect(page.getByRole('link', { name: /राहदानी/ }).first()).toBeVisible()
  })

  test('Nepali search by romanised transliteration finds the page', async ({ page }) => {
    await page.goto('/ne/search?q=passport%20banaune')
    await expect(page.getByRole('link', { name: /राहदानी/ }).first()).toBeVisible()
  })

  test('a search with no match explains itself rather than showing nothing', async ({ page }) => {
    await page.goto('/en/search?q=zzzqqqxxyy')
    await expect(page.getByText('No results found.')).toBeVisible()
    await expect(page.getByText('Try different words')).toBeVisible()
  })

  test('an unverified fee is never shown as a number', async ({ page }) => {
    await page.goto('/en/services/e-passport')
    await expect(page.getByText(/Amount not verified/i).first()).toBeVisible()
  })

  test('autocomplete suggests the procedure while typing', async ({ page }) => {
    await page.goto('/en')
    await page.getByRole('combobox', { name: /what do you need|तपाईंलाई के काम/i }).fill('passp')
    await expect(page.getByRole('option').first()).toBeVisible()
  })
})
