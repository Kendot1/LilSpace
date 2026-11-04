import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Download, Plus, Upload, Pencil, Trash2, Image as ImageIcon } from 'lucide-react'
import Modal from './Modal'
import { personal } from '../data/personal'
import { exportBackup, mergeMemories, parseBackup, readMemoryPhoto, validateMemory, type Memory } from '../lib/storage'
import { exportIndexedRecovery, loadIndexedMemories, saveIndexedMemories } from '../lib/indexed-memories'

function Editor({ memory, save, close }: { memory?: Memory; save: (m: Memory) => Promise<void>; close: () => void }) {
 const [title,setTitle]=useState(memory?.title||''), [date,setDate]=useState(memory?.date||new Date().toISOString().slice(0,10)), [story,setStory]=useState(memory?.story||''), [photo,setPhoto]=useState(memory?.photo||''), [error,setError]=useState(''), [reading,setReading]=useState(false)
 const photoRead=useRef<AbortController|null>(null)
 useEffect(()=>()=>{photoRead.current?.abort()},[])
 const cancelRead=()=>{photoRead.current?.abort();photoRead.current=null;setReading(false)}
 const submit=async(e:FormEvent)=>{e.preventDefault();if(photoRead.current)return;try{await save(validateMemory({id:memory?.id||crypto.randomUUID(),title,date,story,photo}))}catch(e){setError(e instanceof Error?e.message:'Could not save. Your writing is still here.')}}
 const read=async(file?:File)=>{
  cancelRead()
  if(!file)return
  const controller=new AbortController()
  photoRead.current=controller
  setError('');setReading(true)
  try{const next=await readMemoryPhoto(file,controller.signal);if(photoRead.current===controller)setPhoto(next)}
  catch(e){if(photoRead.current===controller&&!controller.signal.aborted)setError(e instanceof Error?e.message:'This photo could not be read. Try another file.')}
  finally{if(photoRead.current===controller){photoRead.current=null;setReading(false)}}
 }
 return <form className="memory-form" onSubmit={submit}>{error&&<p className="error" role="alert">{error}</p>}<label>Title<input autoFocus required maxLength={100} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Give this moment a name"/></label><label>Date<input required type="date" value={date} onChange={e=>setDate(e.target.value)}/></label><label>Story<textarea required maxLength={3000} rows={5} value={story} onChange={e=>setStory(e.target.value)} placeholder="The little things you want to keep…"/></label><label>Photo (optional)<input aria-label="Memory photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>void read(e.target.files?.[0])}/></label><small>JPEG, PNG, or WebP. Up to 2 MB.</small>{photo&&<div className="photo-preview"><img src={photo} alt="Selected memory"/><button type="button" className="text-button" onClick={()=>{cancelRead();setPhoto('')}}>Remove photo</button></div>}<div className="form-actions"><button type="button" className="button quiet" onClick={close}>Cancel</button><button className="button primary" disabled={reading}>{reading?'Reading photo…':'Save memory'}</button></div></form>
}

export default function Memories() {
 const [local,setLocal]=useState<Memory[]>([]), [notice,setNotice]=useState(''), [error,setError]=useState(false), [editor,setEditor]=useState<Memory|null|undefined>(undefined), [deleting,setDeleting]=useState<Memory>(), [busy,setBusy]=useState(true)
 const input=useRef<HTMLInputElement>(null)
 const currentLocal=useRef(local)
 const backupBusy=useRef(false)
 const writeBusy=useRef(false)
 useEffect(()=>{let active=true;void loadIndexedMemories().then(loaded=>{if(active){currentLocal.current=loaded.memories;setLocal(loaded.memories);setNotice(loaded.error);setError(Boolean(loaded.error));setBusy(false)}});return()=>{active=false}},[])
 const supplied=personal.memories.filter(m=>!local.some(l=>l.id===m.id)), all=[...supplied,...local].sort((a,b)=>b.date.localeCompare(a.date))
 const commit=async(next:Memory[],restore=false)=>{await saveIndexedMemories(next,{restore,expected:currentLocal.current});currentLocal.current=next;setLocal(next);setError(false)}
 const save=async(m:Memory)=>{if(writeBusy.current)throw new Error('Please wait for the current save.');writeBusy.current=true;try{await commit(editor?currentLocal.current.map(item=>item.id===m.id?m:item):[...currentLocal.current,m]);setEditor(undefined);setNotice('Memory saved on this browser.')}finally{writeBusy.current=false}}
 const remove=async()=>{if(writeBusy.current)return;writeBusy.current=true;try{await commit(currentLocal.current.filter(m=>m.id!==deleting?.id));setDeleting(undefined);setNotice('Memory deleted from this browser.')}catch(e){setNotice(String(e instanceof Error?e.message:e));setError(true)}finally{writeBusy.current=false}}
 const download=async()=>{if(backupBusy.current)return;backupBusy.current=true;setBusy(true);try{const loaded=await loadIndexedMemories();if(loaded.error){await exportIndexedRecovery();setNotice('Recovery copy downloaded. Saved data is still unreadable and unchanged. This raw file may not be importable; keep it safe and restore a valid backup to resume saving.');setError(true)}else{await exportBackup([...personal.memories.filter(m=>!loaded.memories.some(l=>l.id===m.id)),...loaded.memories],false);setNotice('Backup downloaded. Keep it somewhere safe.');setError(false)}}catch(e){setNotice(e instanceof Error?e.message:'The backup could not be exported. Saved data was not changed.');setError(true)}finally{backupBusy.current=false;setBusy(false)}}
 const importFile=async(file?:File)=>{
  if(!file||backupBusy.current)return
  backupBusy.current=true;setBusy(true)
  try{
   if(file.size>12000000)throw new Error('This backup is too large (maximum 12 MB).')
   const incoming=parseBackup(await file.text())
   // Recheck after reading: the library or recovery state may have changed meanwhile.
   const restore=Boolean((await loadIndexedMemories()).error)
   if(restore&&!window.confirm('Restore this validated backup over unreadable saved data? Export a recovery copy first if needed.'))return
   const existing=currentLocal.current
   const next=mergeMemories(existing,incoming,personal.memories)
   if(writeBusy.current)throw new Error('Please wait for the current save before importing.')
   writeBusy.current=true
   try { await commit(next,restore) } finally { writeBusy.current=false }
   setNotice(`${next.length-existing.length} new memories imported. Matching IDs and supplied project memories were kept, not replaced.`)
  }catch(e){setNotice(e instanceof Error?e.message:'The backup could not be imported.');setError(true)}
  finally{backupBusy.current=false;setBusy(false);if(input.current)input.current.value=''}
 }
 return <section id="memories" className="section-shell section-space"><div className="section-heading"><span className="kicker">The moments we keep</span><h2>Our memories</h2><p>Not just the big days. The ordinary, lovely, worth-remembering ones, too.</p></div><div className="memory-toolbar"><button className="button primary" disabled={busy} onClick={()=>setEditor(null)}><Plus size={17}/>Add a memory</button><div className="backup-actions"><button className="button outline" disabled={busy} onClick={()=>void download()}><Download size={16}/>Export backup</button><button className="button outline" disabled={busy} onClick={()=>input.current?.click()}><Upload size={16}/>Import backup</button></div><input hidden ref={input} type="file" accept="application/json,.json" aria-label="Import backup file" onChange={e=>void importFile(e.target.files?.[0])}/></div>{notice&&<p className={error?'notice error':'notice'} role={error?'alert':'status'}>{notice}</p>}{busy&&<p role="status">Preparing your backup…</p>}{all.length?<div className="memory-grid">{all.map(m=><article className="memory-card" key={m.id}>{m.photo?<img src={m.photo} alt={'Photo for '+m.title} loading="lazy" onError={e=>{e.currentTarget.style.display='none'}}/>:<div className="memory-illustration" aria-hidden="true"><ImageIcon size={34}/></div>}<div className="memory-body"><time dateTime={m.date}>{new Date(`${m.date}T12:00:00`).toLocaleDateString(undefined,{month:'long',day:'numeric',year:'numeric'})}</time><h3>{m.title}</h3><p>{m.story}</p>{local.some(l=>l.id===m.id)?<div className="card-actions"><button className="text-button" aria-label={`Edit ${m.title}`} onClick={()=>setEditor(m)}><Pencil size={15}/>Edit</button><button className="text-button" aria-label={`Delete ${m.title}`} onClick={()=>setDeleting(m)}><Trash2 size={15}/>Delete</button></div>:<small>From your personal content file. Edit this memory there.</small>}</div></article>)}</div>:<div className="memory-empty"><div className="paper-stack" aria-hidden="true"><ImageIcon size={30}/></div><h3>Every collection starts with one.</h3><p>A walk. A quiet afternoon. A tiny thing you don’t want to forget.</p><button className="text-button" disabled={busy} onClick={()=>setEditor(null)}>Write your first memory</button></div>}<details className="storage-note"><summary>Where do our memories live?</summary><p>Local memories and photos are stored in IndexedDB in this browser on this device. They do not automatically sync, and clearing browser data may erase them. Export a backup regularly; import it on another device to move your memories manually. Backups contain the photos, so treat them as personal files.</p><p>Up to 100 local memories; photos up to 2 MB each. Browser storage can fill before those limits. Project memories are edited in the content file. No account, cloud storage, or notifications are connected.</p></details>{editor!==undefined&&<Modal title={editor?'Edit memory':'Add a memory'} onClose={()=>setEditor(undefined)}><Editor memory={editor||undefined} save={save} close={()=>setEditor(undefined)}/></Modal>}{deleting&&<Modal title="Delete this memory?" onClose={()=>setDeleting(undefined)}><p>“{deleting.title}” will be removed from this browser. Export a backup first if you want to keep a copy.</p><div className="form-actions"><button className="button quiet" onClick={()=>setDeleting(undefined)}>Keep it</button><button className="button danger" onClick={remove}>Delete memory</button></div></Modal>}</section>
}
