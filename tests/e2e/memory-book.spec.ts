import { test, expect } from '@playwright/test'

test('memory book browses saved pages and keeps direct library access', async ({ page }) => {
 await page.addInitScript(() => localStorage.setItem('her-little-space.memories.v1', JSON.stringify({version:1,memories:[
  {id:'one',title:'First page',date:'2026-01-01',story:'First story'},
  {id:'two',title:'Second page',date:'2026-02-01',story:'Second story'},
 ]})))
 await page.goto('/')
 await page.getByRole('button',{name:'Their little space',exact:true}).click()
 await page.getByRole('button',{name:'Open the memory book'}).click()
 const book=page.locator('.world-discovery')
 await expect(book.getByText('Second story')).toBeVisible()
 await expect(book.getByText('Page 1 of 2')).toBeVisible()
 await book.getByRole('button',{name:'Next memory'}).click()
 await expect(page.locator('.world-canvas')).toHaveAttribute('data-page-direction','1')
 await expect(book.getByText('First story')).toBeVisible()
 await expect(book.getByRole('button',{name:'Next memory'})).toBeDisabled()
 await book.getByRole('button',{name:'Previous memory'}).click()
 await expect(page.locator('.world-canvas')).toHaveAttribute('data-page-direction','-1')
 await expect(book.getByText('Second story')).toBeVisible()
 await expect(book.getByRole('button',{name:'Browse and add memories'})).toBeVisible()
})

test('memory book has an honest empty state', async ({page}) => {
 await page.goto('/')
 await page.getByRole('button',{name:'Their little space',exact:true}).click()
 await page.getByRole('button',{name:'Open the memory book'}).click()
 await expect(page.locator('.world-discovery')).toContainText('No memories have been added yet')
})
