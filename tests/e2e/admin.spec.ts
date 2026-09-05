import { expect, test } from '@playwright/test'

const EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com'
const PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'LocalDevAdmin!2026'

test.describe('admin', () => {
  test('the admin area is not reachable without signing in', async ({ page }) => {
    await page.goto('/admin/procedures')
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test('editing a procedure writes an audit log entry', async ({ page }) => {
    await page.goto('/admin/login')
    await page.getByLabel('Email').fill(EMAIL)
    await page.getByLabel('Password').fill(PASSWORD)
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page).toHaveURL(/\/admin$/)
    await page.getByRole('link', { name: 'Procedures' }).click()

    await page.getByRole('link', { name: /Registering for the National Identity Card/ }).click()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    const marker = `E2E edit ${Date.now()}`
    await page.getByLabel('Notes / exceptions (English)').fill(marker)
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByRole('status').first()).toContainText('Saved')

    // The change must be traceable in the audit log.
    await page.goto('/admin/audit')
    await expect(page.getByText('procedure.update').first()).toBeVisible()
  })

  test('the publication gate blocks an unsourced procedure', async ({ page }) => {
    await page.goto('/admin/login')
    await page.getByLabel('Email').fill(EMAIL)
    await page.getByLabel('Password').fill(PASSWORD)
    await page.getByRole('button', { name: 'Sign in' }).click()
    // Wait for the sign-in redirect to settle before navigating away, or the
    // in-flight server action navigation cancels this goto.
    await page.waitForURL(/\/admin$/)

    await page.goto('/admin/procedures')
    // The PAN record is seeded with a source but no steps, fees or documents,
    // because its requirements were never verified.
    await page.getByRole('link', { name: /^PAN/ }).click()

    await expect(page.getByText('Blocked from publication')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Publish' })).toBeDisabled()
  })

  test('the admin area is excluded from indexing', async ({ page }) => {
    const response = await page.goto('/robots.txt')
    const body = (await response!.text()).toLowerCase()
    expect(body).toContain('disallow: /admin')
  })
})
