import { afterEach, describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { personal } from '../src/data/personal'
import { createWorld } from '../src/worlds/createWorld'

const originalGallery = personal.gallery
const flush = async () => { await new Promise(resolve => setTimeout(resolve, 0)) }
afterEach(() => { personal.gallery = originalGallery; vi.restoreAllMocks(); vi.unstubAllGlobals() })

describe('3D gallery frame', () => {
  it('rejects remote, traversal and encoded paths without making a request', () => {
    personal.gallery = ['https://example.com/a.jpg', '//example.com/a.jpg', '/photos/../secret.jpg', '/photos/%2e%2e/a.jpg'].map(src => ({ src, alt: '', caption: '' }))
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    const world = createWorld('little-space')
    expect(fetchSpy).not.toHaveBeenCalled()
    world.dispose()
  })

  it('disposes a texture that finishes loading after the world is destroyed', async () => {
    personal.gallery = [{ src: '/photos/keepsake.png', alt: '', caption: '' }]
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, blob: async () => new Blob(['photo'], { type: 'image/png' }) }))
    const revoke = vi.fn()
    vi.stubGlobal('URL', { createObjectURL: () => 'blob:local-photo', revokeObjectURL: revoke })
    let finish!: (texture: THREE.Texture<HTMLImageElement>) => void
    vi.spyOn(THREE.TextureLoader.prototype, 'loadAsync').mockReturnValue(new Promise(resolve => { finish = resolve }))
    const world = createWorld('little-space')
    await flush()
    world.dispose()
    const texture = new THREE.Texture({ width: 1, height: 1 } as HTMLImageElement)
    const dispose = vi.spyOn(texture, 'dispose')
    finish(texture)
    await flush()
    expect(dispose).toHaveBeenCalledOnce()
    expect(revoke).toHaveBeenCalledWith('blob:local-photo')
  })

  it('leaves the empty insert when a local photo fails to load', async () => {
    personal.gallery = [{ src: '/photos/missing.jpg', alt: '', caption: '' }]
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('unavailable')))
    const world = createWorld('little-space')
    await flush()
    const insert = world.targets.find(target => target.id === 'photo')!.object.getObjectByName('gallery-photo-insert')
    expect(insert?.visible).toBe(false)
    world.dispose()
  })

  it('loads a local gallery photo onto the selectable frame and disposes it', async () => {
    personal.gallery = [{ src: '/photos/keepsake.webp', alt: 'A keepsake', caption: '' }]
    const texture = new THREE.Texture({ width: 800, height: 400 } as HTMLImageElement)
    const dispose = vi.spyOn(texture, 'dispose')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, blob: async () => new Blob(['photo'], { type: 'image/webp' }) }))
    vi.stubGlobal('URL', { createObjectURL: () => 'blob:local-photo', revokeObjectURL: vi.fn() })
    const load = vi.spyOn(THREE.TextureLoader.prototype, 'loadAsync').mockResolvedValue(texture)
    const world = createWorld('little-space')
    await flush()
    const frame = world.targets.find(target => target.id === 'photo')!.object
    let mapped = false
    frame.traverse(object => {
      if (object instanceof THREE.Mesh && object.material instanceof THREE.MeshStandardMaterial && object.material.map === texture) mapped = true
    })
    expect(fetch).toHaveBeenCalledWith('/photos/keepsake.webp', expect.objectContaining({ redirect: 'error' }))
    expect(load).toHaveBeenCalledWith('blob:local-photo')
    expect(mapped).toBe(true)
    expect(texture.colorSpace).toBe(THREE.SRGBColorSpace)
    world.dispose()
    expect(dispose).toHaveBeenCalledOnce()
  })
})
