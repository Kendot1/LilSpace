import { test, expect } from '@playwright/test'

test('gallery is editable and its empty state does not invent photos', async ({ page }) => {
  await page.goto('/#gallery')
  await expect(page.getByRole('heading', { name: 'A little gallery' })).toBeVisible()
  await expect(page.getByText('Add photos in the personal content file')).toBeVisible()
})

test('all requested sections remain navigable with WebGL unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') return null
      return original.call(this, type, ...args as [])
    } as typeof HTMLCanvasElement.prototype.getContext
  })
  await page.goto('/')
  for (const section of ['home', 'about', 'gallery', 'reminders', 'memories', 'surprise']) {
    await page.getByRole('button', { name: new RegExp(section === 'surprise' ? 'A little surprise' : section === 'about' ? 'About her' : section === 'reminders' ? 'Gentle reminders' : section === 'memories' ? 'Our memories' : section === 'gallery' ? 'Gallery' : 'Home', 'i') }).first().click()
    await expect(page.locator(`#${section}`)).toBeAttached()
  }
})
