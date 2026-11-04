import { describe,it,expect } from 'vitest'
import { Color } from 'three'
import { sampleWorldAtmosphere } from '../src/worlds/world-atmosphere'
import type { World } from '../src/worlds/createWorld'

describe('destination arrival atmosphere',()=>{
 it('clears arrival mist into distinct stable palettes',()=>{
  const sky=new Color(),sun=new Color(),palettes=new Set<string>()
  for(const world of ['coast','journey','mountain','little-space'] as World[]){
   const start=sampleWorldAtmosphere(world,0,sky,sun)
   const end=sampleWorldAtmosphere(world,1,sky,sun)
   expect(start.fog).toBeGreaterThan(end.fog)
   expect(end.intensity).toBeGreaterThan(start.intensity)
   palettes.add(sky.getHexString())
   expect(sampleWorldAtmosphere(world,2,sky,sun)).toEqual(end)
  }
  expect(palettes.size).toBe(4)
 })
})
