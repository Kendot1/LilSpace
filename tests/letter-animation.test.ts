import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { createLetterAnimation } from '../src/worlds/letter-animation'

describe('letter animation', () => {
  it('opens a hinged flap and draws out paper, then returns exactly to its closed pose', () => {
    const parent = new THREE.Group()
    const letter = createLetterAnimation(parent)
    const flap = parent.getObjectByName('letter-flap-hinge')!
    const paper = parent.getObjectByName('letter-emerging-paper')!
    const closed = [flap.rotation.x, paper.position.z, paper.position.y]
    letter.setProgress(1)
    expect(flap.rotation.x).not.toBe(closed[0])
    expect(paper.position.z).not.toBe(closed[1])
    letter.setProgress(0)
    expect([flap.rotation.x, paper.position.z, paper.position.y]).toEqual(closed)
    letter.dispose()
  })
  it('clamps progress and treats nonfinite values as closed', () => {
    const parent = new THREE.Group()
    const letter = createLetterAnimation(parent)
    const flap = parent.getObjectByName('letter-flap-hinge')!
    letter.setProgress(1)
    const opened = flap.rotation.x
    letter.setProgress(10)
    expect(flap.rotation.x).toBe(opened)
    letter.setProgress(NaN)
    expect(flap.rotation.x).toBe(0)
    letter.dispose()
  })
  it('disposes each owned geometry and material once and detaches the root', () => {
    const parent = new THREE.Group()
    const letter = createLetterAnimation(parent)
    const objects: THREE.Mesh[] = []
    parent.traverse(object => { if (object instanceof THREE.Mesh) objects.push(object) })
    const geometries = new Set(objects.map(object => object.geometry))
    const materials = new Set(objects.map(object => object.material as THREE.Material))
    let events = 0
    for (const resource of [...geometries, ...materials]) resource.addEventListener('dispose', () => { events++ })
    letter.dispose(); letter.dispose(); letter.setProgress(1)
    expect(events).toBe(geometries.size + materials.size)
    expect(parent.children).toHaveLength(0)
  })
})
