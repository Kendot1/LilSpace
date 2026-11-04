import { test, expect } from '@playwright/test'

test('projected keepsakes update when viewport aspect changes without moving the camera', async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 900 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#worlds')
  await page.getByRole('button', { name: 'Explore at your own pace', exact: true }).click()
  const canvas = page.locator('.world-canvas')
  await expect(canvas.locator('canvas')).toBeVisible()
  const before = await canvas.getAttribute('data-targets')
  await page.setViewportSize({ width: 1200, height: 900 })
  await expect.poll(() => canvas.getAttribute('data-targets')).not.toBe(before)
})

test('switching worlds at a stationary camera refreshes projected keepsakes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#worlds')
  await page.getByRole('button', { name: 'Explore at your own pace', exact: true }).click()
  const canvas = page.locator('.world-canvas')
  await expect(canvas.locator('canvas')).toBeVisible()
  await page.getByRole('group', { name: 'Choose a world' }).getByRole('button', { name: 'Baguio', exact: true }).click()
  await expect.poll(async () => JSON.parse((await canvas.getAttribute('data-targets')) || '[]').map((target: { id: string }) => target.id)).toContain('book')
})
