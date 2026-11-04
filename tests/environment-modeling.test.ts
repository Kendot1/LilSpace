import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { createWorld } from '../src/worlds/createWorld'

describe('environment modeling', () => {
  it('builds a varied, branched pine canopy shared across the mountain forest', () => {
    const world = createWorld('mountain')
    const branches = world.group.getObjectByName('pine-branch-canopies') as THREE.InstancedMesh
    expect(branches).toBeInstanceOf(THREE.InstancedMesh)
    expect(branches.count).toBeGreaterThan(100)
    expect(branches.geometry.attributes.position.count).toBeGreaterThan(20)
    branches.geometry.computeBoundingBox()
    expect(branches.geometry.boundingBox!.max.x - branches.geometry.boundingBox!.min.x).toBeGreaterThan(.5)
    world.dispose()
  })
})
