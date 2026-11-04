import { describe, expect, it } from 'vitest'
import { createWorld } from '../src/worlds/createWorld'

describe('world letter inspection', () => {
 it('opens and closes the letter on inspection in every destination containing one', () => {
  for (const destination of ['coast', 'mountain', 'little-space'] as const) {
   const world = createWorld(destination)
   const hinge = world.group.getObjectByName('letter-flap-hinge')!
   expect(hinge).toBeDefined()
   world.inspect('letter', 1)
   expect(hinge.rotation.x).toBeGreaterThan(2)
   world.inspect(undefined, 0)
   expect(hinge.rotation.x).toBe(0)
   world.dispose()
  }
 })
})
