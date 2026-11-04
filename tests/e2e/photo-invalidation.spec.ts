import { expect, test } from '@playwright/test'

test('a delayed local fixture redraws the production frame in reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addInitScript(() => {
    const gl = WebGL2RenderingContext.prototype
    const original = gl.drawElements
    gl.drawElements = function (...args) {
      ;(window as unknown as { draws: number }).draws = ((window as unknown as { draws: number }).draws || 0) + 1
      return original.apply(this, args)
    }
  })
  // Replace only the served production bundle in this browser session; no personal file is changed.
  await page.route('**/assets/index-*.js', async route => {
    const response = await route.fetch()
    const source = await response.text()
    expect(source).toContain('gallery:[],memories:[]')
    await route.fulfill({ response, body: source.replace('gallery:[],memories:[]', 'gallery:[{src:"/photos/test-fixture.png",alt:"Test fixture",caption:""}],memories:[]') })
  })
  let release!: () => void
  const gate = new Promise<void>(resolve => { release = resolve })
  let requested!: () => void
  const request = new Promise<void>(resolve => { requested = resolve })
  await page.route('**/photos/test-fixture.png', async route => {
    requested()
    await gate
    await route.fulfill({ contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aWQAAAAASUVORK5CYII=', 'base64') })
  })
  try {
    await page.goto('/#worlds')
    await page.getByRole('button', { name: 'Explore at your own pace', exact: true }).click()
    await page.getByRole('group', { name: 'Choose a world' }).getByRole('button', { name: 'Their little space', exact: true }).click()
    await request
    const host = page.locator('.world-canvas')
    await expect(host).toHaveAttribute('data-world', 'little-space')
    await host.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)
    const before = await page.evaluate(() => (window as unknown as { draws: number }).draws || 0)
    release()
    await expect.poll(() => page.evaluate(() => (window as unknown as { draws: number }).draws || 0)).toBeGreaterThan(before)
  } finally { release() }
})
