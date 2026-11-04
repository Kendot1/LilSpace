import { describe, expect, it } from 'vitest'
import { Vector3 } from 'three'
import { sampleStoryCamera } from '../src/worlds/story-camera'

describe('editorial story camera',()=>{
 it('uses finite, distinct reversible close-up poses',()=>{
  const position=new Vector3(),look=new Vector3()
  sampleStoryCamera(.15,false,false,position,look);const start=position.clone()
  sampleStoryCamera(.45,false,false,position,look);expect(position.distanceTo(start)).toBeGreaterThan(2)
  sampleStoryCamera(.15,false,false,position,look);expect(position.equals(start)).toBe(true)
  for(const mobile of [true,false])for(const p of [0,.25,.5,.75,1]){sampleStoryCamera(p,mobile,false,position,look);expect([...position.toArray(),...look.toArray()].every(Number.isFinite)).toBe(true)}
 })
 it('holds a stable camera under reduced motion',()=>{
  const position=new Vector3(),look=new Vector3();sampleStoryCamera(0,true,true,position,look);const start=position.clone()
  sampleStoryCamera(1,true,true,position,look);expect(position.equals(start)).toBe(true)
 })
})
