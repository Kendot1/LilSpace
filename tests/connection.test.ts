import { describe, it, expect } from 'vitest'
import * as T from 'three'
import { createConnection } from '../src/worlds/createConnection'

describe('narrative landscape and connection',()=>{
 it('keeps coast, winding road, mountain and garden as real geometry',()=>{
  const scene=createConnection()
  const coast=scene.group.getObjectByName('la-union-coastal-grove')!
  expect(coast.children.length).toBeGreaterThan(4)
  const road=scene.group.getObjectByName('winding-mountain-road') as T.Mesh
  expect(road.geometry.getAttribute('position').count).toBeGreaterThan(100)
  expect(scene.group.getObjectByName('baguio-symbolic-pine-terraces')).toBeTruthy()
  expect(scene.group.getObjectByName('central-jasmine-garden-arbor')).toBeTruthy()
  const city=scene.group.getObjectByName('quezon-city-symbolic-urban-garden')!
  scene.setProgress(0,false);expect(city.visible).toBe(false)
  scene.setProgress(1,false);expect(city.visible).toBe(true)
  scene.setProgress(0,true);expect(city.visible).toBe(false)
  scene.dispose()
 })
 it('reveals the city gradually and reversibly without fading shared scenery',()=>{
  const scene=createConnection()
  const city=scene.group.getObjectByName('quezon-city-symbolic-urban-garden')!
  const cityMesh=city.children.find(o=>o instanceof T.InstancedMesh) as T.InstancedMesh
  const mat=cityMesh.material as T.Material
  const outside: T.Material[]=[]
  scene.group.traverse(o=>{if(o instanceof T.Mesh && o.parent!==city && !city.getObjectById(o.id)) outside.push(...(Array.isArray(o.material)?o.material:[o.material]))})
  expect(outside).not.toContain(mat)
  scene.setProgress(.8,false)
  expect(city.visible).toBe(true)
  expect(mat.opacity).toBeGreaterThan(0)
  expect(mat.opacity).toBeLessThan(1)
  const middle=mat.opacity
  scene.setProgress(1,false);expect(mat.opacity).toBe(1)
  scene.setProgress(.8,true);expect(mat.opacity).toBeCloseTo(middle)
  scene.setProgress(0,true);expect(city.visible).toBe(false)
  let disposals=0
  mat.addEventListener('dispose',()=>{disposals++})
  scene.dispose();scene.dispose()
  expect(disposals).toBe(1)
 })
 it('has distinct male and female symbolic figures and reversible approach',()=>{
  const scene=createConnection()
  scene.setProgress(0,false)
  const start=scene.male.position.distanceTo(scene.female.position)
  expect(start).toBeGreaterThan(5)
  const initial=scene.male.position.clone()
  scene.setProgress(1,false)
  expect(scene.male.position.distanceTo(scene.female.position)).toBeLessThan(start)
  scene.setProgress(0,false)
  expect(scene.male.position.distanceTo(initial)).toBeLessThan(.001)
  const bounds=new T.Box3().setFromObject(scene.group)
  expect(bounds.isEmpty()).toBe(false)
  const house=scene.group.getObjectByName('pine-cottage-with-welcoming-porch')!
  const city=scene.group.getObjectByName('quezon-city-symbolic-urban-garden')!
  expect(house.scale.x).toBe(2)
  expect(city.position.z).toBeLessThan(-10)
  expect(new T.Box3().setFromObject(house).getSize(new T.Vector3()).y).toBeGreaterThan(5)
  scene.update(1,.016,false);scene.setProgress(1,true)
  scene.group.traverse(o=>expect(o.position.toArray().every(Number.isFinite)).toBe(true))
  scene.dispose();scene.dispose()
 })
})
