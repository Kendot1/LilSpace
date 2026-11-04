import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { createWorld } from '../src/worlds/createWorld'

describe('coastal surface detail', () => {
  it('gives the beach a resolved, varied sand surface', () => {
    const world = createWorld('coast')
    const sand = world.group.getObjectByName('continuous-landscape') as THREE.Mesh
    expect(sand.geometry.attributes.position.count).toBeGreaterThan(10000)
    expect((sand.material as THREE.MeshStandardMaterial).vertexColors).toBe(true)
    world.dispose()
  })

  it('shapes the driftwood as a weathered, tapered branch under the letter', () => {
    const world = createWorld('coast')
    const wood = world.group.getObjectByName('sun-bleached-driftwood') as THREE.Mesh
    expect(wood.geometry.attributes.position.count).toBeGreaterThan(100)
    expect(world.targets.map(target => target.id)).toEqual(expect.arrayContaining(['shell', 'letter', 'flower']))
    world.dispose()
  })

  it('varies the width of the shoreline wash rather than repeating straight bands', () => {
    const world = createWorld('coast')
    const foam = world.group.getObjectByName('shoreline-foam-lace-0') as THREE.Mesh
    const positions = foam.geometry.attributes.position
    const widths = Array.from({ length: positions.count / 2 }, (_, i) => positions.getZ(i * 2) - positions.getZ(i * 2 + 1))
    expect(Math.max(...widths) - Math.min(...widths)).toBeGreaterThan(.12)
    world.update(4, .016, false)
    expect((foam.material as THREE.ShaderMaterial).uniforms.uTime.value).toBe(4)
    world.update(4, .016, true)
    expect((foam.material as THREE.ShaderMaterial).uniforms.uTime.value).toBe(0)
    world.dispose()
  })
})
