import { describe, expect, it } from 'vitest'
import { Box3, Vector3 } from 'three'
import { createWorld } from '../src/worlds/createWorld'

describe('memory book page', () => {
  it('turns a tangible hinged sheet in either direction and resets it', () => {
    const world = createWorld('little-space')
    const hinge = world.group.getObjectByName('memory-page-hinge')
    expect(hinge).toBeDefined()
    const sheet = world.group.getObjectByName('memory-turning-page')!
    expect(new Box3().setFromObject(sheet).getSize(new Vector3()).length()).toBeGreaterThan(.1)
    world.turnMemoryPage(1, .5)
    expect(hinge!.rotation.z).toBeGreaterThan(1)
    world.turnMemoryPage(-1, .5)
    expect(hinge!.rotation.z).toBeGreaterThan(1)
    world.turnMemoryPage(1, 1)
    expect(hinge!.visible).toBe(false)
    world.dispose()
  })
})
