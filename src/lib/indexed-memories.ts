import { loadMemories, parseBackup, STORAGE_KEY, type Memory } from './storage'

const DB_NAME = 'her-little-space'
const STORE = 'memories'
const KEY = 'library'
const readError = 'Saved memories could not be read. Nothing has been overwritten. Export your saved data or restore a valid backup before saving.'

function openDatabase(): Promise<IDBDatabase> {
 return new Promise((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, 1)
  request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE) }
  request.onerror = () => reject(request.error)
  request.onblocked = () => reject(new Error('Close other tabs and try again.'))
  request.onsuccess = () => { request.result.onversionchange = () => request.result.close(); resolve(request.result) }
 })
}

/** A transaction serializes first migration and later writes across browser tabs. */
async function transact(next?: Memory[], restore = false, expected?: Memory[]): Promise<Memory[]> {
 const db = await openDatabase()
 try {
  return await new Promise((resolve, reject) => {
   const tx = db.transaction(STORE, 'readwrite')
   const store = tx.objectStore(STORE)
   const request = store.get(KEY)
   let result: Memory[] = []
   let failure: unknown
   request.onsuccess = () => {
    try {
     const existing = request.result
     if (existing === undefined) {
      const legacy = loadMemories()
      if (legacy.error && !restore) throw new Error(readError)
      result = legacy.memories
      if (expected && JSON.stringify(result) !== JSON.stringify(expected)) throw new Error('Memories changed in another tab. Reload before saving; your writing is still here.')
      if (next !== undefined) result = next
      store.put({version:1,memories:result}, KEY)
     } else {
      try { result = parseBackup(JSON.stringify(existing)) }
      catch { if (!restore) throw new Error(readError) }
      if (expected && JSON.stringify(result) !== JSON.stringify(expected)) throw new Error('Memories changed in another tab. Reload before saving; your writing is still here.')
      if (next !== undefined) { result = next; store.put({version:1,memories:result}, KEY) }
     }
    } catch (error) { failure = error; tx.abort() }
   }
   tx.oncomplete = () => resolve(result)
   tx.onabort = () => reject(failure || tx.error || new Error('Storage transaction failed.'))
   tx.onerror = () => { /* onabort reports failures after rollback */ }
  })
 } finally { db.close() }
}

/** Export only losslessly JSON-representable records; never write during recovery. */
export async function exportIndexedRecovery(): Promise<void> {
 const db = await openDatabase()
 let value: unknown
 try {
  value = await new Promise<unknown>((resolve, reject) => {
   const tx = db.transaction(STORE, 'readonly')
   const request = tx.objectStore(STORE).get(KEY)
   request.onsuccess = () => resolve(request.result)
   request.onerror = () => reject(request.error)
   tx.onabort = () => reject(tx.error)
  })
 } finally { db.close() }
 let text: string
 if (value === undefined) {
  const legacy = localStorage.getItem(STORAGE_KEY)
  if (legacy === null) throw new Error('No saved recovery data could be read. Nothing was downloaded or changed.')
  text = legacy
 } else {
  const seen = new Set<object>()
  const check = (item: unknown): void => {
   if (item === null || typeof item === 'string' || typeof item === 'boolean' || (typeof item === 'number' && Number.isFinite(item))) return
   if (typeof item !== 'object' || seen.has(item)) throw new Error('Saved data cannot be safely represented as JSON. Nothing was downloaded or changed.')
   seen.add(item)
   if (!Array.isArray(item) && Object.getPrototypeOf(item) !== Object.prototype) throw new Error('Saved data cannot be safely represented as JSON. Nothing was downloaded or changed.')
   if (Array.isArray(item)) {
    for (let i = 0; i < item.length; i++) { if (!(i in item)) throw new Error('Saved data cannot be safely represented as JSON. Nothing was downloaded or changed.'); check(item[i]) }
   } else Object.values(item).forEach(check)
   seen.delete(item)
  }
  check(value)
  text = JSON.stringify(value)
 }
 const url = URL.createObjectURL(new Blob([text], {type:'application/json'}))
 try { const a = document.createElement('a'); a.href = url; a.download = 'her-little-space-recovery.json'; a.click() }
 finally { setTimeout(() => URL.revokeObjectURL(url), 1000) }
}

export async function loadIndexedMemories(): Promise<{memories:Memory[];error:string}> {
 try { return {memories:await transact(),error:''} }
 catch { return {memories:[],error:readError} }
}
export async function saveIndexedMemories(memories:Memory[], options: {restore?:boolean; expected?:Memory[]} = {}): Promise<void> {
 const validated = parseBackup(JSON.stringify({version:1,memories}))
 try { await transact(validated,options.restore,options.expected) }
 catch (error) {
  if (error instanceof Error && (error.message === readError || error.message.startsWith('Memories changed'))) throw error
  throw new Error('This browser could not save your memory. Storage may be full or blocked. Your writing is still here; try a smaller photo or export a backup.')
 }
}
