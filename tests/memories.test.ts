import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import type { ReactElement } from 'react'
import Memories from '../src/components/Memories'
import { personal } from '../src/data/personal'
import { STORAGE_KEY } from '../src/lib/storage'

// A small hook harness exercises callbacks without adding a DOM dependency.
const hooks = vi.hoisted(() => ({values:[] as unknown[], cursor:0}))
vi.mock('react', async importOriginal => ({
 ...await importOriginal<typeof import('react')>(),
 useState:(initial:unknown) => {
  const index=hooks.cursor++
  if (!(index in hooks.values)) hooks.values[index]=typeof initial==='function'?initial():initial
  return [hooks.values[index],(next:unknown)=>{hooks.values[index]=next}]
 },
 useRef:(initial:unknown) => {
  const index=hooks.cursor++
  return hooks.values[index] ?? (hooks.values[index]={current:initial})
 },
}))
type Node = ReactElement<Record<string, unknown>>
function nodes(value:unknown):Node[] {
 if(Array.isArray(value))return value.flatMap(nodes)
 if(!value||typeof value!=='object'||!('props' in value))return []
 const element=value as Node
 return [element,...nodes(element.props.children)]
}
function render(){hooks.cursor=0;return nodes(Memories())}
function find(tree:Node[],predicate:(node:Node)=>boolean){const node=tree.find(predicate);expect(node).toBeDefined();return node!}
const memory={id:'local',title:'Walk',story:'Moment',date:'2026-01-02'}
let raw:string|null
beforeEach(()=>{
 hooks.values=[];hooks.cursor=0;raw=null
 vi.stubGlobal('localStorage',{getItem:()=>raw,setItem:(key:string,value:string)=>{expect(key).toBe(STORAGE_KEY);raw=value}})
})
const suppliedBefore = [...personal.memories]
afterEach(()=>{personal.memories.splice(0,personal.memories.length,...suppliedBefore);vi.restoreAllMocks();vi.unstubAllGlobals()})
it('does not erase a memory saved while an import file is still being read',async()=>{
 let finish!:(text:string)=>void
 const text=new Promise<string>(resolve=>{finish=resolve})
 const tree=render()
 const input=find(tree,node=>node.props['aria-label']==='Import backup file')
 ;(input.props.onChange as (event:unknown)=>void)({target:{files:[{size:1,text:()=>text}]}})
 const add=find(tree,node=>node.type==='button'&&nodes(node.props.children).some(child=>child.props.size===17))
 ;(add.props.onClick as ()=>void)()
 const editor=find(render(),node=>typeof node.props.save==='function')
 ;(editor.props.save as (value:unknown)=>void)(memory)
 finish(JSON.stringify({version:1,memories:[{...memory,id:'imported'}]}))
 await vi.waitFor(()=>expect(JSON.parse(raw!).memories).toHaveLength(2))
 expect(JSON.parse(raw!).memories.map((m:typeof memory)=>m.id)).toEqual(['local','imported'])
})
it('checks the current corrupt-data state rather than a stale mount error',async()=>{
 raw='{broken'
 const confirm=vi.fn(()=>true)
 vi.stubGlobal('window',{confirm})
 const input=find(render(),node=>node.props['aria-label']==='Import backup file')
 const importFile=input.props.onChange as (event:unknown)=>void
 const event={target:{files:[{size:1,text:async()=>JSON.stringify({version:1,memories:[memory]})}]}}
 importFile(event)
 await vi.waitFor(()=>expect(raw).toContain('local'))
 expect(confirm).toHaveBeenCalledOnce()
 importFile(event)
 await vi.waitFor(()=>expect(find(render(),node=>node.props.role==='status').props.children).toContain('0 new memories'))
 expect(confirm).toHaveBeenCalledOnce()
})
it('keeps supplied project memories out of local imports',async()=>{
 const supplied={...memory,id:'supplied'}
 personal.memories.push(supplied)
 const input=find(render(),node=>node.props['aria-label']==='Import backup file')
 ;(input.props.onChange as (event:unknown)=>void)({target:{files:[{size:1,text:async()=>JSON.stringify({version:1,memories:[supplied,memory]})}]}})
 await vi.waitFor(()=>expect(raw).not.toBeNull())
 expect(JSON.parse(raw!).memories).toEqual([memory])
})
