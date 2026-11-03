import { afterEach, describe, expect, it, vi } from 'vitest'
import { mergeMemories, exportBackup, loadMemories, saveMemories, STORAGE_KEY, parseBackup, validateMemory, readMemoryPhoto } from '../src/lib/storage'
const memory = {id:'a', title:'Walk', date:'2026-01-02', story:'Moment'}
const backup = (memories: unknown[]) => JSON.stringify({version:1,memories})
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals() })
function storage(raw: string | null = null) {
 const data = new Map<string,string>(raw === null ? [] : [[STORAGE_KEY,raw]])
 const local = {getItem:(key:string) => data.get(key) ?? null, setItem:(key:string,value:string) => { data.set(key,value) }}
 vi.stubGlobal('localStorage',local)
 return local
}
describe('exports', () => {
 function download() {
  let blob: Blob | undefined
  const click = vi.fn()
  vi.stubGlobal('document',{createElement:() => ({click,href:'',download:''})})
  vi.spyOn(URL,'createObjectURL').mockImplementation(value => { blob = value as Blob; return 'blob:test' })
  vi.spyOn(URL,'revokeObjectURL').mockImplementation(() => {})
  return {text:() => blob!.text(),click}
 }
 it('exports current in-memory writing instead of stale saved state', async () => {
  storage(backup([memory]))
  const output = download()
  const photo = 'data:image/png;base64,AAAA'
  await exportBackup([{...memory,story:'Unsaved writing',photo}])
  expect(parseBackup(await output.text())).toEqual([{...memory,story:'Unsaved writing',photo}])
  expect(output.click).toHaveBeenCalledOnce()
 })
 it('recovers unreadable raw saved data without rewriting it', async () => {
  const local = storage('{corrupt')
  const output = download()
  await exportBackup([])
  expect(await output.text()).toBe('{corrupt')
  expect(local.getItem(STORAGE_KEY)).toBe('{corrupt')
 })
 it('exports even when storage reads are blocked', async () => {
  vi.stubGlobal('localStorage',{getItem:() => {throw new Error('blocked')}})
  const output = download()
  await exportBackup([memory])
  expect(parseBackup(await output.text())).toEqual([memory])
 })
 it('embeds local photo assets so backups travel across devices', async () => {
  storage()
  const output = download()
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(new Uint8Array([1,2,3]),{headers:{'Content-Type':'image/png'}})))
  await exportBackup([{...memory,photo:'/photos/day.png'}])
  expect(parseBackup(await output.text())[0].photo).toBe('data:image/png;base64,AQID')
 })
 it('does not download an incomplete backup when local photos cannot be read', async () => {
  storage()
  const output = download()
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response('',{status:404})))
  await expect(exportBackup([{...memory,photo:'/photos/missing.png'}])).rejects.toThrow(/photo/i)
  expect(output.click).not.toHaveBeenCalled()
 })
})
describe('photo reading', () => {
 it('rejects invalid files before creating a reader', async () => {
  const Reader = vi.fn()
  vi.stubGlobal('FileReader', Reader)
  await expect(readMemoryPhoto(new File(['text'], 'fake.png', {type:'text/plain'}))).rejects.toThrow(/JPEG/i)
  expect(Reader).not.toHaveBeenCalled()
 })
 it('aborts an obsolete read and ignores its later completion', async () => {
  const reader = {readAsDataURL:vi.fn(),abort:vi.fn(),onload:null as null | (() => void),onerror:null,onabort:null,result:'data:image/png;base64,AQID'}
  vi.stubGlobal('FileReader',class { constructor() { return reader } })
  const controller = new AbortController()
  const reading = readMemoryPhoto(new File(['photo'], 'day.png', {type:'image/png'}),controller.signal)
  const rejection = expect(reading).rejects.toMatchObject({name:'AbortError'})
  controller.abort()
  reader.onload?.()
  await rejection
  expect(reader.abort).toHaveBeenCalledOnce()
 })
 it('returns a validated photo and removes handlers after reading', async () => {
  const reader = {readAsDataURL:vi.fn(),abort:vi.fn(),onload:null as null | (() => void),onerror:null,onabort:null,result:'data:image/png;base64,AQID'}
  vi.stubGlobal('FileReader',class { constructor() { return reader } })
  const reading = readMemoryPhoto(new File(['photo'], 'day.png', {type:'image/png'}))
  reader.onload?.()
  await expect(reading).resolves.toBe(reader.result)
  expect(reader.onload).toBeNull()
 })
 it('rejects read failures and synchronous browser errors', async () => {
  const reader = {readAsDataURL:vi.fn(),abort:vi.fn(),onload:null,onerror:null as null | (() => void),onabort:null,result:null}
  vi.stubGlobal('FileReader',class { constructor() { return reader } })
  const reading = readMemoryPhoto(new File(['photo'], 'day.png', {type:'image/png'}))
  reader.onerror?.()
  await expect(reading).rejects.toThrow(/could not be read/i)
  reader.readAsDataURL.mockImplementation(()=>{throw new Error('unavailable')})
  await expect(readMemoryPhoto(new File(['photo'], 'day.png', {type:'image/png'}))).rejects.toThrow(/could not be read/i)
 })
 it('rejects malformed reader results rather than accepting an invalid preview', async () => {
  const reader = {readAsDataURL:vi.fn(),abort:vi.fn(),onload:null as null | (() => void),onerror:null,onabort:null,result:'data:image/svg+xml;base64,AQID'}
  vi.stubGlobal('FileReader',class { constructor() { return reader } })
  const reading = readMemoryPhoto(new File(['photo'], 'day.png', {type:'image/png'}))
  reader.onload?.()
  await expect(reading).rejects.toThrow(/JPEG/i)
 })
})
describe('merge', () => {
 it('keeps supplied records separate while importing local additions', () => {
  const supplied = [{...memory,id:'supplied'}]
  expect(mergeMemories([], [supplied[0],memory], supplied)).toEqual([memory])
  expect(mergeMemories([memory], [{...memory,title:'Replacement'},supplied[0]], supplied)).toEqual([memory])
 })
 it('preserves existing IDs, appends new IDs and does not mutate inputs', () => {
  const incoming = [{...memory,title:'Replacement'},{...memory,id:'b'}]
  expect(mergeMemories([memory],incoming)).toEqual([memory,incoming[1]])
  expect(incoming[0].title).toBe('Replacement')
  expect(() => mergeMemories([memory],[{...memory,id:'b'},{...memory,id:'b'}])).toThrow(/duplicate/i)
  expect(() => mergeMemories(Array.from({length:100},(_,i) => ({...memory,id:String(i)})),[memory])).toThrow()
 })
})
describe('saving', () => {
 it('treats an empty saved string as unreadable rather than an empty library', () => {
  storage('')
  expect(loadMemories().error).not.toBe('')
  expect(() => saveMemories([])).toThrow()
 })
 it('keeps saved data and UI objects intact on quota failures', () => {
  const local = storage(backup([memory]))
  vi.spyOn(local,'setItem').mockImplementation(() => {throw new Error('QuotaExceededError')})
  const writing = [{...memory,story:'Still here'}]
  expect(() => saveMemories(writing)).toThrow(/writing is still here/)
  expect(writing[0].story).toBe('Still here')
  expect(local.getItem(STORAGE_KEY)).toBe(backup([memory]))
 })
 it('reports blocked reads without throwing', () => {
  vi.stubGlobal('localStorage',{getItem:() => {throw new Error('SecurityError')}})
  expect(loadMemories()).toEqual({memories:[],error:expect.stringMatching(/could not be read/)})
 })
 it('validates before writing and preserves the previous data', () => {
  const local = storage(backup([memory]))
  expect(() => saveMemories([{...memory,date:'2026-02-30'}])).toThrow()
  expect(local.getItem(STORAGE_KEY)).toBe(backup([memory]))
 })
 it('blocks accidental saves over unreadable data until explicit valid restoration', () => {
  const local = storage('{broken')
  expect(loadMemories().error).toMatch(/could not be read/)
  expect(() => saveMemories([memory])).toThrow(/restore|unreadable/i)
  expect(local.getItem(STORAGE_KEY)).toBe('{broken')
  expect(() => saveMemories([{...memory,title:''}], {restore:true})).toThrow()
  expect(local.getItem(STORAGE_KEY)).toBe('{broken')
  saveMemories([memory], {restore:true})
  expect(loadMemories()).toEqual({memories:[memory],error:''})
 })
})
describe('memory validation', () => {
 it('accepts leap days and rejects zero years and non-calendar dates', () => {
  expect(validateMemory({...memory,date:'2024-02-29'}).date).toBe('2024-02-29')
  for (const date of ['0000-01-01','1900-02-29','2026-04-31','2026-13-01','2026-00-01','2026-01-00','26-01-01']) expect(() => validateMemory({...memory,date})).toThrow()
 })
 it('enforces field bounds, backup counts and unique normalized IDs', () => {
  for (const patch of [{id:'x'.repeat(101)},{title:'x'.repeat(101)},{story:'x'.repeat(3001)},{id:''}]) expect(() => validateMemory({...memory,...patch})).toThrow()
  expect(parseBackup(backup(Array.from({length:100},(_,i) => ({...memory,id:String(i)}))))).toHaveLength(100)
  expect(() => parseBackup(backup(Array.from({length:101},(_,i) => ({...memory,id:String(i)}))))).toThrow()
  expect(() => parseBackup(backup([memory,{...memory,id:' a '}]))).toThrow(/duplicate/i)
  for (const invalid of [null,[],{}, {version:'1',memories:[]},{version:1,memories:{}}]) expect(() => parseBackup(JSON.stringify(invalid))).toThrow()
 })
 it('accepts safe photo formats and local files', () => {
  for (const photo of ['data:image/jpeg;base64,AQID','data:image/png;base64,AQ==','data:image/webp;base64,AQI=','/photos/day.jpg','/photos/2026/day-1.webp']) expect(validateMemory({...memory,photo}).photo).toBe(photo)
 })
 it('trims valid entries', () => { expect(validateMemory({id:'a',title:' Walk ',date:'2026-01-02',story:' Quiet moment. '})).toEqual({id:'a',title:'Walk',date:'2026-01-02',story:'Quiet moment.'}) })
 it('rejects invalid entries', () => { for (const patch of [{title:' '},{date:'2026-02-30'},{story:'a'.repeat(3001)}]) expect(()=>validateMemory({id:'a',title:'Walk',date:'2026-01-02',story:'Moment',...patch})).toThrow() })
 it('rejects traversal and malformed photo payloads', () => {
  for (const photo of ['/photos/../secret.png','/photos/a/../../x.jpg','/photos/%2e%2e/x.png','/photos//x.png','/photos/x.svg','data:image/png;base64,====','data:image/png;base64,a','data:image/svg+xml;base64,AAAA']) {
   expect(() => validateMemory({id:'a',title:'Walk',date:'2026-01-02',story:'Moment',photo}), photo).toThrow()
  }
 })
 it('accepts a photo at the advertised 2 MiB limit without overflowing validation', () => {
  const photo = 'data:image/png;base64,' + Buffer.alloc(2 * 1024 * 1024).toString('base64')
  expect(validateMemory({...memory,photo}).photo).toBe(photo)
 })
 it('limits photos to 2 MiB decoded and backup JSON to 12 MB UTF-8', () => {
  const photo = 'data:image/png;base64,' + 'AAAA'.repeat(699051)
  expect(photo.length).toBeLessThan(2800000)
  expect(() => validateMemory({...memory,photo})).toThrow()
  const largeUnicode = backup([]) + ' '.repeat(11999920) + '💙'.repeat(15)
  expect(largeUnicode.length).toBeLessThan(12000000)
  expect(() => parseBackup(largeUnicode)).toThrow(/large/i)
 })
 it('validates the whole backup', () => {
 expect(parseBackup(JSON.stringify({version:1,memories:[]}))).toEqual([])
 for(const text of ['{bad',JSON.stringify({version:2,memories:[]}),JSON.stringify({version:1,memories:[{id:'a'}]})]) expect(()=>parseBackup(text)).toThrow()
 })
})
