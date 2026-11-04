import { describe,it,expect } from 'vitest'
import * as T from 'three'
import { createConnectionLandscape } from '../src/worlds/connection-landscape'

describe('continuous landscape replacement',()=>{
 it('extends beyond camera framing with nonflat terrain and animated water',()=>{
  const model=createConnectionLandscape()
  const land=model.group.getObjectByName('sculpted-unbroken-terrain') as T.Mesh<T.PlaneGeometry>
  expect(land).toBeDefined()
  land.geometry.computeBoundingBox()
  const box=land.geometry.boundingBox!
  expect(box.max.x-box.min.x).toBeGreaterThan(100)
  expect(box.max.y-box.min.y).toBeGreaterThan(5)
  expect(model.group.getObjectByName('animated-tidal-horizon')).toBeDefined()
  expect(model.group.getObjectByName('continuous-twilight-ground')).toBeUndefined()
  expect(model.height(0,2)).toBeLessThan(-.9)
  expect(model.height(6,2)).toBeGreaterThan(-.1)
  expect(model.group.getObjectByName('bridge-tidal-channel')).toBeDefined()
  model.update(10,false);model.update(10,true)
  model.dispose()
  expect(model.group.children.length).toBe(0)
 })
})
