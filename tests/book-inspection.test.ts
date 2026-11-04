import { describe,it,expect } from 'vitest'
import { createWorld } from '../src/worlds/createWorld'

describe('physical book inspection',()=>{
 it('opens retained hinges and restores original resting poses',()=>{
  const scene=createWorld('mountain')
  const hinges: Array<{ rotation:{z:number}; resting:number }>=[]
  scene.group.traverse(object=>{if(object.name==='book-cover-hinge')hinges.push({rotation:object.rotation,resting:object.rotation.z})})
  expect(hinges.length).toBeGreaterThan(0)
  scene.inspect('book',1)
  expect(hinges.some(item=>item.rotation.z>2)).toBe(true)
  scene.inspect(undefined,0)
  for(const item of hinges)expect(item.rotation.z).toBe(item.resting)
  scene.dispose()
 })
})
