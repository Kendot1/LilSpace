import { describe,expect,it } from 'vitest'
import { Vector3 } from 'three'
import { tailoredGarment,surfaceGrain } from '../src/worlds/model-surfaces'
import { createConnection } from '../src/worlds/createConnection'

describe('refined major models',()=>{
 it('builds shaped folded garments with UVs and finite normals',()=>{
  const g=tailoredGarment([[0,.5,.4],[.4,.4,.3],[1,.25,.2]],.04)
  expect(g.attributes.position.count).toBe(147)
  expect(g.attributes.uv.count).toBe(g.attributes.position.count)
  expect(Array.from(g.attributes.normal.array).every(Number.isFinite)).toBe(true)
  g.computeBoundingBox();expect(g.boundingBox!.max.y).toBe(1);g.dispose()
 })
 it('generates local surface textures without fetching assets',()=>{
  for(const kind of ['cloth','wood','stone'] as const){const t=surfaceGrain(kind);expect(t.image.width).toBe(128);expect(t.image.height).toBe(128);t.dispose()}
 })
 it('preserves actual palm contact after replacing clothes and architecture',()=>{
  const scene=createConnection();scene.setProgress(1,false)
  const a=scene.male.getObjectByName('open-reaching-hand')!,b=scene.female.getObjectByName('open-reaching-hand')!
  expect(a.getWorldPosition(new Vector3()).distanceTo(b.getWorldPosition(new Vector3()))).toBeLessThan(.1)
  scene.dispose()
 })
})
