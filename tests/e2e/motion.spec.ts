import { test, expect } from '@playwright/test'

test('carnations are offered toward the viewer and replayable', async ({ page }) => {
 await page.emulateMedia({reducedMotion:'no-preference'})
 await page.goto('/')
 await expect(page.getByRole('button',{name:'Receive your carnations'})).toBeVisible()
 const scene=page.locator('.carnation-scene')
 await expect(scene.locator('canvas')).toBeVisible()
 await expect(scene).toHaveAttribute('data-animation-clip','carnation-handoff')
 await expect(page.getByRole('button',{name:'Receive your carnations'})).toHaveAttribute('aria-pressed','false')
 await page.getByRole('button',{name:'Receive your carnations'}).click()
 await expect(page.getByRole('button',{name:'Offer the flowers again'})).toHaveAttribute('aria-pressed','true')
 await expect(scene).toHaveAttribute('data-gift','received')
 await expect.poll(async()=>Number(await scene.getAttribute('data-offer-progress'))).toBeGreaterThan(.95)
 await expect(page.getByRole('button',{name:'Offer the flowers again'})).toBeVisible()
 await page.getByRole('button',{name:'Offer the flowers again'}).click()
 await expect(scene).toHaveAttribute('data-gift','offered')
 for(const id of ['about','gallery','reminders','memories','surprise']){
  await page.locator('#'+id).scrollIntoViewIfNeeded()
  await expect(page.locator('#'+id)).toHaveAttribute('data-scroll-progress',/.+/)
 }
})

test('reduced motion keeps every section readable and flowers receivable',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'})
 await page.setViewportSize({width:375,height:812})
 await page.goto('/')
 await expect(page.getByRole('button',{name:'Receive your carnations'})).toHaveAttribute('aria-pressed','false')
 await page.getByRole('button',{name:'Receive your carnations'}).click()
 await expect(page.getByRole('button',{name:'Offer the flowers again'})).toHaveAttribute('aria-pressed','true')
 await expect(page.locator('.carnation-scene')).toHaveAttribute('data-gift','received')
 for(const id of ['home','about','gallery','reminders','memories','surprise']){
  await page.locator('#'+id).scrollIntoViewIfNeeded()
  expect(await page.locator('#'+id).evaluate(el=>getComputedStyle(el).opacity)).toBe('1')
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
})
