import { expect, it } from 'vitest'
import { Box3, InstancedMesh, Mesh, DoubleSide } from 'three'
import { createBouquet } from '../src/visual/createBouquet'

it('builds five layered carnation heads with instanced petals and bounded geometry',()=>{
 const {bouquet,flowers,dispose}=createBouquet()
 expect(flowers).toHaveLength(5)
 bouquet.traverse(o=>{if(o instanceof Mesh&&!Array.isArray(o.material)&&o.material.name==='foliage') expect(o.material.side).toBe(DoubleSide)})
 let foliage=0
 bouquet.traverse(o=>{if(o instanceof Mesh&&!Array.isArray(o.material)&&o.material.name==='foliage')foliage++})
 expect(foliage).toBeGreaterThan(0)
 let batches=0,petals=0
 bouquet.traverse(o=>{if(o instanceof InstancedMesh){batches++;petals+=o.count}})
 expect(batches).toBe(5)
 expect(petals).toBeGreaterThan(400)
 const box=new Box3().setFromObject(bouquet)
 expect(box.min.y).toBeGreaterThan(-3)
 expect(box.max.y).toBeLessThan(3)
 expect(Number.isFinite(box.max.x)).toBe(true)
 dispose()
})
