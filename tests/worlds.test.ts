import { describe, expect, it } from 'vitest'
import * as T from 'three'
import { createWorld, type World } from '../src/worlds/createWorld'

describe('procedural explorable worlds',()=>{
 for(const kind of ['coast','journey','mountain','little-space'] as World[]){
  it(`${kind} has substantial finite geometry and named selectable keepsakes`,()=>{
   const model=createWorld(kind)
   const box=new T.Box3().setFromObject(model.group)
   expect(box.isEmpty()).toBe(false)
   expect(box.max.x-box.min.x).toBeGreaterThan(10)
   const targets=model.targets.map(x=>x.id)
   expect(targets.length).toBeGreaterThan(0)
   expect(new Set(targets).size).toBe(targets.length)
   for(const target of model.targets){expect(target.label.length).toBeGreaterThan(0);expect(new T.Box3().setFromObject(target.object).isEmpty()).toBe(false)}
   model.update(1,.016,false);model.update(4,.016,true)
   model.group.traverse(object=>{expect(object.position.toArray().every(Number.isFinite)).toBe(true)})
   model.dispose()
  })
 }
 it('gift geometry actually changes and closes for replay',()=>{
  const model=createWorld('little-space')
  const pose=()=>{const values:number[]=[];model.group.traverse(o=>values.push(...o.position.toArray(),...o.quaternion.toArray(),...o.scale.toArray()));return values}
  model.openGift(0);const closed=pose();model.openGift(1);expect(pose()).not.toEqual(closed);model.openGift(0);expect(pose()).toEqual(closed);model.dispose()
 })
})
