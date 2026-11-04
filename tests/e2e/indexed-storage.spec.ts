import { test, expect } from '@playwright/test'

test('migrates legacy photos into IndexedDB and keeps the original', async ({ page }) => {
 const raw = JSON.stringify({version:1,memories:[{id:'legacy',title:'A walk',date:'2026-01-02',story:'Together',photo:'data:image/png;base64,AQID'}]})
 await page.addInitScript(value => localStorage.setItem('her-little-space.memories.v1',value), raw)
 await page.goto('/')
 await expect(page.getByRole('heading',{name:'A walk'})).toBeVisible()
 await page.getByRole('button',{name:'Edit A walk'}).click()
 await page.getByLabel('Title').fill('Edited walk')
 await page.getByRole('button',{name:'Save memory'}).click()
 await expect(page.getByRole('heading',{name:'Edited walk'})).toBeVisible()
 await page.reload()
 await expect(page.getByRole('heading',{name:'Edited walk'})).toBeVisible()
 await page.getByRole('button',{name:'Delete Edited walk'}).click()
 await page.getByRole('button',{name:'Delete memory'}).click()
 await expect(page.getByRole('heading',{name:'Edited walk'})).toHaveCount(0)
 const saved = await page.evaluate(async () => {
  const db = await new Promise<IDBDatabase>((resolve,reject) => {const request=indexedDB.open('her-little-space');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)})
  const record = await new Promise<unknown>((resolve,reject) => {const request=db.transaction('memories').objectStore('memories').get('library');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)})
  db.close()
  return record
 })
 expect(saved).toBeTruthy()
 expect(await page.evaluate(() => localStorage.getItem('her-little-space.memories.v1'))).toBe(raw)
})
