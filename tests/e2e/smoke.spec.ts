import { test, expect } from '@playwright/test'

test('home shows brand and demo feeds', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'Word of Mouth' }).first()).toBeVisible()
  await expect(page.getByText('Employment opportunities')).toBeVisible()
  await expect(page.getByText('Demo', { exact: false }).first()).toBeVisible()
})

test('health endpoint ok', async ({ request }) => {
  const res = await request.get('/api/health')
  expect(res.ok()).toBeTruthy()
  const json = await res.json()
  expect(json.ok).toBe(true)
  expect(json.feeds).toBeGreaterThanOrEqual(4)
})

test('sources and search pages load', async ({ page }) => {
  await page.goto('/sources')
  await expect(page.getByRole('heading', { name: 'Sources' })).toBeVisible()
  await page.goto('/search')
  await expect(page.getByRole('heading', { name: 'Search' })).toBeVisible()
})

test('create feed from home and open detail', async ({ page }) => {
  await page.goto('/#create')
  const query = page.locator('#query')
  await query.waitFor({ state: 'visible' })
  await query.fill('Open source developer tooling and typescript platform news')
  await page.getByRole('button', { name: '+ Add a custom title' }).click()
  await page.locator('#title').fill('QA tooling feed')
  await page.getByRole('button', { name: 'Create feed' }).click()
  await expect(page).toHaveURL(/\/feeds\//, { timeout: 90_000 })
  await expect(page.getByRole('heading', { name: 'QA tooling feed' })).toBeVisible()
})
