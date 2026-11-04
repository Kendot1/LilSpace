import { test, expect } from '@playwright/test'

test('keyboard controls turn pages immediately with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addInitScript(() => localStorage.setItem('her-little-space.memories.v1', JSON.stringify({ version: 1, memories: [
    { id: 'a', title: 'A', date: '2026-01-01', story: 'Story A' },
    { id: 'b', title: 'B', date: '2026-02-01', story: 'Story B' },
  ] })))
  await page.goto('/')
  await page.getByRole('button', { name: 'Their little space', exact: true }).click()
  await page.getByRole('button', { name: 'Open the memory book' }).click()
  const next = page.getByRole('button', { name: 'Next memory' })
  await expect(next).toBeEnabled()
  await next.focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('.world-discovery')).toContainText('Story A')
  await expect(page.locator('.world-canvas')).toHaveAttribute('data-page-progress', '1')
})
