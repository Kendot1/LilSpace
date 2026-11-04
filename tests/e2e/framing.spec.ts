import { test, expect } from '@playwright/test'

for (const width of [1200, 390]) {
  test(`coast and Baguio home views restore after interaction at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 850 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/#worlds')
    await page.getByRole('button', { name: 'Explore at your own pace', exact: true }).click()
    const host = page.locator('.world-canvas')
    await expect(host.locator('canvas')).toBeVisible()
    for (const [label, world] of [['La Union', 'coast'], ['Baguio', 'mountain']]) {
      await page.getByRole('group', { name: 'Choose a world' }).getByRole('button', { name: label, exact: true }).click()
      await expect(host).toHaveAttribute('data-world', world)
      const before = await host.getAttribute('data-targets')
      await page.getByRole('button', { name: 'Look left', exact: true }).click()
      await expect.poll(() => host.getAttribute('data-targets')).not.toBe(before)
      await page.getByRole('button', { name: 'Return to the main view', exact: true }).click()
      await expect.poll(() => host.getAttribute('data-targets')).toBe(before)
    }
  })
}
