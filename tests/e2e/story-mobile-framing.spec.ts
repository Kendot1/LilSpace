import { test, expect } from '@playwright/test'

for (const motion of ['reduce', 'no-preference'] as const) {
 test(`mobile connection composition: ${motion}`, async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: motion })
  await page.goto('/')
  await page.getByRole('button', { name: 'Follow the story', exact: true }).click()
  const track = page.locator('.narrative-track')
  await track.evaluate(el => {
   const top = el.getBoundingClientRect().top + scrollY
   window.scrollTo({ top: top - 78 + (el.clientHeight - innerHeight + 78) * .6, behavior: 'instant' })
  })
  await expect.poll(async () => Number(await track.getAttribute('data-progress'))).toBeCloseTo(.6, 2)
  await expect(page.locator('.world-canvas canvas')).toBeVisible()
  await page.locator('.narrative-sticky').screenshot({ path: testInfo.outputPath(`connection-${motion}.png`) })
 })
}
