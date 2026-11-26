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
