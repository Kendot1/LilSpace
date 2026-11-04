import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

 test('surprise visibly journeys from coast to mountains, supports skipping and replays', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'))
  await page.goto('/#surprise')
  const journey = page.locator('.surprise-journey')
  await page.getByRole('button', { name: 'Open your letter' }).click()
  await expect(journey).toHaveAttribute('data-chapter', 'coast')
  await expect(journey.getByRole('status')).toContainText('sea breeze')
  await page.clock.runFor(1100)
  await expect(journey).toHaveAttribute('data-chapter', 'mountains')
  await page.clock.runFor(500)
  await expect.poll(() => page.locator('.journey-mountains').evaluate(el => Number(getComputedStyle(el).opacity))).toBeGreaterThan(0)
  await page.clock.runFor(600)
  await expect(page.locator('.letter-paper')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Replay surprise' })).toBeFocused()
  await page.getByRole('button', { name: 'Replay surprise' }).click()
  await page.getByRole('button', { name: 'Open your letter' }).click()
  await page.getByRole('button', { name: 'Skip to letter' }).click()
  await expect(page.locator('.letter-paper')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Replay surprise' })).toBeFocused()
 })

 test('reduced motion reveals immediately and preference changes finish the journey', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#surprise')
  await page.getByRole('button', { name: 'Open your letter' }).click()
  await expect(page.locator('.surprise-journey')).toHaveAttribute('data-chapter', 'letter')
  expect(await page.locator('.letter-paper').evaluate(el => getComputedStyle(el).animationName)).toBe('none')
  await page.getByRole('button', { name: 'Replay surprise' }).click()
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.getByRole('button', { name: 'Open your letter' }).click()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('.letter-paper')).toBeVisible()
 })

 test('memory photo survives save, refresh, export, deletion and import', async ({ page }) => {
  await page.goto('/#memories')
  await page.getByRole('button', { name: 'Add a memory', exact: true }).first().click()
  await page.getByLabel('Title', { exact: true }).fill('Photo backup check')
  await page.getByLabel('Date', { exact: true }).fill('2026-10-10')
  await page.getByLabel('Story', { exact: true }).fill('Automated test content only.')
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jS1sAAAAASUVORK5CYII=', 'base64')
  await page.getByLabel('Memory photo', { exact: true }).setInputFiles({ name: 'test.png', mimeType: 'image/png', buffer: png })
  await expect(page.locator('.photo-preview img')).toBeVisible()
  await page.getByRole('button', { name: 'Save memory', exact: true }).click()
  await page.reload()
  const photo = page.locator('.memory-card img')
  await expect(photo).toBeVisible()
  expect(await photo.evaluate(el => (el as HTMLImageElement).naturalWidth)).toBe(1)
  const pending = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export backup' }).click()
  const backup = await pending
  await page.getByRole('button', { name: 'Delete Photo backup check' }).click()
  await page.getByRole('button', { name: 'Delete memory', exact: true }).click()
  await page.getByLabel('Import backup file').setInputFiles((await backup.path())!)
  await expect(photo).toBeVisible()
  expect(await photo.evaluate(el => (el as HTMLImageElement).naturalWidth)).toBe(1)
})

for (const width of [320, 390, 768, 1440, 1920]) {
  test(`production styles, layout, and letter accessibility at ${width}px`, async ({ page }) => {
   const errors: string[] = []
   page.on('pageerror', error => errors.push(error.message))
   await page.setViewportSize({ width, height: 900 })
   await page.emulateMedia({ reducedMotion: 'reduce' })
   await page.goto('/')
   const css = await page.locator('link[rel="stylesheet"]').evaluateAll(links => links.map(link => (link as HTMLLinkElement).href))
   expect(css.length).toBeGreaterThan(0)
   for (const url of css) {
    const response = await page.request.get(url)
    expect(response.ok()).toBe(true)
    expect(response.headers()['content-type']).toContain('text/css')
   }
   expect(await page.locator('.home').evaluate(el => getComputedStyle(el).display)).toBe('grid')
   for (const id of ['home', 'about', 'gallery', 'reminders', 'memories', 'surprise']) {
    await page.locator('#' + id).scrollIntoViewIfNeeded()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
   }
   await page.getByRole('button', { name: 'Open your letter' }).click()
   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
   const a11y = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
   expect(a11y.violations).toEqual([])
   await page.screenshot({ path: `test-results/surprise-${width}.png` })
   await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
   await page.screenshot({ path: `test-results/home-${width}.png` })
   expect(errors).toEqual([])
  })
 }
