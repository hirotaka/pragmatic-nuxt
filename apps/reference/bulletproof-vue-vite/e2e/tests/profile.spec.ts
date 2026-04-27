import { test, expect } from '@playwright/test'

test('profile', async ({ page }) => {
  // update user:
  await page.goto('/app/profile', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Update Profile' }).click()
  await page.getByLabel('Bio').click()
  await page.getByLabel('Bio').fill('My bio')
  await page.getByRole('button', { name: 'Submit' }).click()
  await page.getByLabel('Profile Updated').getByRole('button', { name: 'Close' }).click()
  await expect(page.getByText('My bio')).toBeVisible()
})
