import { describe, expect, it } from 'vitest'
import { Box3, PerspectiveCamera, Vector3 } from 'three'
import { createConnection } from '../src/worlds/createConnection'
import { sampleStoryCamera } from '../src/worlds/story-camera'

describe('mobile connection framing', () => {
 for (const reduced of [false, true]) {
  it(`keeps both actual figures in frame at the connection beat (reduced motion: ${reduced})`, () => {
   const scene = createConnection()
   scene.setProgress(.6, reduced)
   const position = new Vector3(), look = new Vector3()
   sampleStoryCamera(.6, true, reduced, position, look)
   const camera = new PerspectiveCamera(43, 390 / (844 - 78), .1, 100)
   camera.position.copy(position); camera.lookAt(look); camera.updateMatrixWorld(); camera.updateProjectionMatrix()
   for (const figure of [scene.male, scene.female]) {
    const bounds = new Box3().setFromObject(figure, true)
    expect(bounds.isEmpty()).toBe(false)
    for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
     const point = new Vector3(x, y, z).project(camera)
     expect(Math.abs(point.x), `${figure.name} projected x`).toBeLessThan(.95)
     expect(Math.abs(point.y), `${figure.name} projected y`).toBeLessThan(.95)
     expect(point.z).toBeLessThan(1)
    }
   }
   scene.dispose()
  })
 }
})
