import { afterEach, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { personal } from '../src/data/personal'
import { createWorld } from '../src/worlds/createWorld'

const gallery = personal.gallery
const flush = () => new Promise(resolve => setTimeout(resolve, 0))
afterEach(() => { personal.gallery = gallery; vi.restoreAllMocks(); vi.unstubAllGlobals() })

it('invalidates after a local photo is ready, but not after disposal', async () => {
  personal.gallery = [{ src: '/photos/fixture.png', alt: '', caption: '' }]
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, blob: async () => new Blob(['fixture'], { type: 'image/png' }) }))
  vi.stubGlobal('URL', { createObjectURL: () => 'blob:fixture', revokeObjectURL: vi.fn() })
  const pending: Array<(texture: THREE.Texture<HTMLImageElement>) => void> = []
  vi.spyOn(THREE.TextureLoader.prototype, 'loadAsync').mockImplementation(() => new Promise(resolve => pending.push(resolve)))
  const invalidate = vi.fn()
  const world = createWorld('little-space', invalidate)
  await flush()
  pending.shift()!(new THREE.Texture({ width: 1, height: 1 } as HTMLImageElement))
  await flush()
  expect(invalidate).toHaveBeenCalledOnce()
  world.dispose()
  const stale = createWorld('little-space', invalidate)
  await flush()
  stale.dispose()
  pending.shift()!(new THREE.Texture({ width: 1, height: 1 } as HTMLImageElement))
  await flush()
  expect(invalidate).toHaveBeenCalledOnce()
})
