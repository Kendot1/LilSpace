import { test, expect } from '@playwright/test'

test('opening story identifies her present place and study destination', async ({ page }) => {
 await page.goto('/#worlds')
 await page.getByRole('button',{name:'Follow the story',exact:true}).click()
 await expect(page.locator('.narrative-place')).toContainText('La Union')
 await expect(page.locator('.narrative-place')).toContainText('Baguio')
 await expect(page.locator('.narrative-place')).toContainText('study')
})
