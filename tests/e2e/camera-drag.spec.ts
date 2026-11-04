import { test, expect } from '@playwright/test'

test('dragging the world changes the view without selecting a keepsake', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#worlds')
  await page.getByRole('button', { name: 'Explore at your own pace', exact: true }).click()
  const host = page.locator('.world-canvas')
  await expect(host.locator('canvas')).toBeVisible()
  await host.scrollIntoViewIfNeeded()
  const box = (await host.boundingBox())!
  const target = JSON.parse((await host.getAttribute('data-targets'))!).find((item: { id: string }) => item.id === 'shell')
  const before = await host.getAttribute('data-camera')
  const x = box.x + box.width * target.x, y = box.y + box.height * target.y
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + 100, y + 35, { steps: 5 })
  await page.mouse.up()
  await expect.poll(() => host.getAttribute('data-camera')).not.toBe(before)
  await expect(page.locator('.world-discovery')).toHaveCount(0)
})

test('touch drag changes the view without opening an object', async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 850 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#worlds')
  await page.getByRole('button', { name: 'Explore at your own pace', exact: true }).click()
  const host = page.locator('.world-canvas')
  await expect(host.locator('canvas')).toBeVisible()
  await host.scrollIntoViewIfNeeded()
  const box = (await host.boundingBox())!
  const before = await host.getAttribute('data-camera')
  const cdp = await context.newCDPSession(page)
  const x = box.x + box.width * .5, y = box.y + box.height * .5
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + 80, y: y + 40 }] })
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await expect.poll(() => host.getAttribute('data-camera')).not.toBe(before)
  await expect(page.locator('.world-discovery')).toHaveCount(0)
  await cdp.detach()
})
