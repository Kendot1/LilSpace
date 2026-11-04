import { describe, expect, it } from 'vitest'
import { PerspectiveCamera, Vector3 } from 'three'
import { sampleStoryCamera } from '../src/worlds/story-camera'

describe('coastal story opening', () => {
 it('frames the shoreline and adjacent sea on desktop and mobile before returning to the story', () => {
  for (const mobile of [false, true]) {
   const position = new Vector3(), look = new Vector3()
   sampleStoryCamera(.08, mobile, false, position, look)
   const camera = new PerspectiveCamera(50, mobile ? 390 / 844 : 1280 / 720, .1, 300)
   camera.position.copy(position); camera.lookAt(look); camera.updateMatrixWorld(); camera.updateProjectionMatrix()
   // Both points sit along the opening sightline: sand at the coastal edge and sea beyond it.
   for (const point of [new Vector3(0, 0, 10), new Vector3(0, -.68, 23)]) {
    const projected = point.project(camera)
    expect(Math.abs(projected.x)).toBeLessThan(1)
    expect(Math.abs(projected.y)).toBeLessThan(1)
    expect(projected.z).toBeLessThan(1)
   }
   const opening = position.clone()
   sampleStoryCamera(.5, mobile, false, position, look)
   expect(position.distanceTo(opening)).toBeGreaterThan(5)
  }
 })
 it('keeps reduced-motion framing stationary across the story', () => {
  for (const mobile of [false, true]) {
   const position = new Vector3(), look = new Vector3()
   sampleStoryCamera(0, mobile, true, position, look)
   const initialPosition = position.clone(), initialLook = look.clone()
   sampleStoryCamera(1, mobile, true, position, look)
   expect(position.equals(initialPosition)).toBe(true)
   expect(look.equals(initialLook)).toBe(true)
  }
 })
})
