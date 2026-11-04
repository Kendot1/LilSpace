import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'

test('exports the unreadable IndexedDB record without replacing it or using stale legacy data', async ({ page }) => {
 await page.goto('/')
 const corrupt = {version: 99, memories: [{title: 'irreplaceable', extra: 'raw'}]}
 await page.evaluate(async value => {
  localStorage.setItem('her-little-space.memories.v1', '{stale legacy')
  const db = await new Promise<IDBDatabase>((resolve, reject) => { const r = indexedDB.open('her-little-space', 1); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error) })
  await new Promise<void>((resolve, reject) => { const tx = db.transaction('memories', 'readwrite'); tx.objectStore('memories').put(value, 'library'); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error) })
  db.close()
 }, corrupt)
 await page.reload()
 await expect(page.getByRole('alert')).toContainText('could not be read')
 const downloadPromise = page.waitForEvent('download')
 await page.getByRole('button', {name: 'Export backup'}).click()
 const download = await downloadPromise
 expect(JSON.parse(await readFile((await download.path())!, 'utf8'))).toEqual(corrupt)
 await expect(page.getByRole('alert')).toContainText('Recovery')
 const after = await page.evaluate(async () => {
  const db = await new Promise<IDBDatabase>((resolve, reject) => { const r = indexedDB.open('her-little-space'); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error) })
  const result = await new Promise<unknown>((resolve, reject) => { const r = db.transaction('memories').objectStore('memories').get('library'); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error) })
  db.close(); return result
 })
 expect(after).toEqual(corrupt)
})
