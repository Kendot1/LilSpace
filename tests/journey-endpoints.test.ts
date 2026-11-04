import { expect, it } from 'vitest'
import { Box3, Color, Vector3 } from 'three'
import { createWorld } from '../src/worlds/createWorld'
import { sampleJourney } from '../src/worlds/journey-camera'

it('places recognizable coastal and cabin landmarks along the camera corridor', () => {
 const world = createWorld('journey')
 const coast = world.group.getObjectByName('journey-coastal-landmark')
 const cabin = world.group.getObjectByName('journey-cabin-landmark')
 expect(coast).toBeDefined()
 expect(cabin).toBeDefined()
 const position = new Vector3(), look = new Vector3(), sky = new Color(), sun = new Color()
 for (const [progress, landmark] of [[0, coast], [1, cabin]] as const) {
  sampleJourney(progress, position, look, sky, sun)
  const center = new Box3().setFromObject(landmark!).getCenter(new Vector3())
  expect(center.distanceTo(position)).toBeLessThan(30)
 }
 world.dispose()
})
