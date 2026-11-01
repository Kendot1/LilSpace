export interface Memory { id: string; title: string; date: string; story: string; photo?: string }
export const STORAGE_KEY = 'her-little-space.memories.v1'
export function validateMemory(value: unknown): Memory {
 if (!value || typeof value !== 'object') throw new Error('Each memory must be an object.')
 const m = value as Record<string, unknown>
 const field = (name: string, max: number) => {
  const v = m[name]
  if (typeof v !== 'string' || !v.trim() || v.length > max) throw new Error(`${name === 'story' ? 'Story' : name === 'title' ? 'Title' : 'ID'} is required and must be within its length limit.`)
  return v.trim()
 }
 const id=field('id',100), title=field('title',100), story=field('story',3000)
 if (typeof m.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(m.date) || m.date.startsWith('0000') || !Number.isFinite(Date.parse(m.date)) || new Date(m.date).toISOString().slice(0,10)!==m.date) throw new Error('Choose a valid date.')
 const result: Memory={id,title,story,date:m.date}
 if (m.photo !== undefined && m.photo !== '') {
  const safePhoto = typeof m.photo === 'string' && (
   /^data:image\/(jpeg|png|webp);base64,(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(m.photo) && !m.photo.endsWith(',') ||
   /^\/photos\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-][A-Za-z0-9_.-]*\.(?:jpe?g|png|webp)$/i.test(m.photo)
  )
  const payload = typeof m.photo === 'string' && m.photo.startsWith('data:') ? m.photo.split(',')[1] : undefined
  const decodedBytes = payload ? payload.length / 4 * 3 - (payload.endsWith('==') ? 2 : payload.endsWith('=') ? 1 : 0) : 0
  if (typeof m.photo !== 'string' || m.photo.length>2800000 || decodedBytes > 2 * 1024 * 1024 || !safePhoto) throw new Error('Use a JPEG, PNG or WebP photo under 2 MB.')
  result.photo=m.photo
 }
 return result
}
export function parseBackup(text: string): Memory[] {
 if(typeof text !== 'string' || text.length>12000000 || new TextEncoder().encode(text).byteLength>12000000) throw new Error('This backup is too large (maximum 12 MB).')
 let data: unknown
 try { data=JSON.parse(text) } catch { throw new Error('This is not a valid JSON backup.') }
 const d=data as {version?:unknown;memories?:unknown}
 if(!d || d.version!==1 || !Array.isArray(d.memories) || d.memories.length>100) throw new Error('Choose a version 1 Her Little Space backup with up to 100 memories.')
 const memories=d.memories.map(validateMemory)
 if(new Set(memories.map(m=>m.id)).size!==memories.length) throw new Error('The backup contains duplicate memory IDs.')
 return memories
}
/** Import policy: existing IDs win; matching incoming IDs are skipped, not updated. */
export function mergeMemories(existing: Memory[], incoming: Memory[]): Memory[] {
 const current = parseBackup(JSON.stringify({version:1,memories:existing}))
 const additions = parseBackup(JSON.stringify({version:1,memories:incoming}))
 const ids = new Set(current.map(memory => memory.id))
 return parseBackup(JSON.stringify({version:1,memories:[...current,...additions.filter(memory => !ids.has(memory.id))]}))
}
export function loadMemories(): {memories:Memory[]; error:string} {
 try { const raw=localStorage.getItem(STORAGE_KEY); return {memories:raw !== null ? parseBackup(raw):[],error:''} }
 catch { return {memories:[],error:'Saved memories could not be read. Nothing has been overwritten. Export your saved data or restore a valid backup before saving.'} }
}
// Only an explicit, validated backup restoration may replace unreadable saved data.
export function saveMemories(memories: Memory[], options: {restore?: boolean} = {}) {
 const text = JSON.stringify({version:1,memories})
 const validated = parseBackup(text)
 const serialized = JSON.stringify({version:1,memories:validated})
 if (!options.restore && loadMemories().error) throw new Error('Saved data is unreadable. Export it or restore a valid backup before saving.')
 try {localStorage.setItem(STORAGE_KEY,serialized)} catch {throw new Error('This browser could not save your memory. Storage may be full or blocked. Your writing is still here; try a smaller photo or export a backup.')}
}
/** Unreadable raw data is exported verbatim for recovery; otherwise export current UI state. */
export async function exportBackup(memories:Memory[]): Promise<void> {
 let recovery: string | undefined
 try {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw !== null) {
   try { parseBackup(raw) } catch { recovery = raw }
  }
 } catch { /* Storage may be blocked; in-memory writing is still exportable. */ }
 let text = recovery
 if (text === undefined) {
  const portable = parseBackup(JSON.stringify({version:1,memories}))
  for (const memory of portable) {
   if (!memory.photo?.startsWith('/photos/')) continue
   try {
    const response = await fetch(memory.photo, {redirect:'error',credentials:'same-origin'})
    if (!response.ok) throw new Error('Photo not found')
    const type = response.headers.get('content-type')?.split(';')[0].trim()
    if (!type || !['image/jpeg','image/png','image/webp'].includes(type)) throw new Error('Unsupported photo')
    const bytes = new Uint8Array(await response.arrayBuffer())
    if (bytes.length > 2 * 1024 * 1024) throw new Error('Photo too large')
    let binary = ''
    for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i,i+8192))
    memory.photo = `data:${type};base64,${btoa(binary)}`
    validateMemory(memory)
   } catch { throw new Error('A local photo could not be included. Restore the photo or remove it before exporting; no incomplete backup was downloaded.') }
  }
  text = JSON.stringify({version:1,memories:portable})
  parseBackup(text)
 }
 const blob=new Blob([text],{type:'application/json'})
 const url=URL.createObjectURL(blob)
 try {
  const a=document.createElement('a')
  a.href=url;a.download='her-little-space-memories.json';a.click()
 } finally {setTimeout(()=>URL.revokeObjectURL(url),1000)}
}
