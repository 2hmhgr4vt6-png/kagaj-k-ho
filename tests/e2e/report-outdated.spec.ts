import { expect, test } from '@playwright/test'

test.describe('report outdated information', () => {
  test('a reader can submit a report without giving any personal ID', async ({ page }) => {
    await page.goto('/en/services/national-id-card')

    const trigger = page.getByRole('button', {
      name: 'Is this information wrong or out of date?',
    })
    await expect(trigger).toBeVisible()
    await trigger.click()

    // The form must warn against submitting identity numbers.
    await expect(page.getByText(/do not include personal details/i)).toBeVisible()
    await expect(page.getByText('We never collect your ID documents')).toBeVisible()

    await page.getByRole('radio', { name: 'Fee changed' }).check()
    await page
      .getByLabel('More detail (optional)')
      .fill('The ward office quoted a different duplicate card fee.')

    await page.getByRole('button', { name: 'Send report' }).click()

    await expect(page.getByRole('status')).toContainText('Thank you')
  })

  test('the form offers every documented reason', async ({ page }) => {
    await page.goto('/en/services/e-passport')
    await page
      .getByRole('button', { name: 'Is this information wrong or out of date?' })
      .click()

    for (const reason of [
      'Fee changed',
      'Documents changed',
      'Office changed',
      'Link broken',
      'Process changed',
      'Other',
    ]) {
      await expect(page.getByRole('radio', { name: reason })).toBeVisible()
    }
  })
})
