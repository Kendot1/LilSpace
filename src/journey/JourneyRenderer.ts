import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { createConnection } from '../worlds/createConnection'

export interface JourneyRendererOptions {
  getProgress: () => number
  getReducedMotion: () => boolean
  onStatus: (status: string) => void
}

/**
 * The renderer deliberately retains the city subtree from the original connection
 * model. It does not use ScrollJourney's replacement geometry or create another city.
 */
export function mountJourneyRenderer(container: HTMLElement, options: JourneyRendererOptions): () => void {
  let disposed = false
  let raf = 0
  let renderQueued = false
  let bouquetRequest = 0
  let bouquet: THREE.Group | undefined
  let city: THREE.Object3D | undefined
  let connection: ReturnType<typeof createConnection> | undefined
  let cityMaterials: THREE.Material[] = []
  let bouquetMaterials: THREE.Material[] = []
  let bouquetGeometries: THREE.BufferGeometry[] = []
  let cityBaseScale = 1
  let bouquetBaseScale = 1
  const originalOpacity = new Map<THREE.Material, number>()
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#d9e1df')
  scene.fog = new THREE.Fog('#d9e1df', 10, 32)
  const camera = new THREE.PerspectiveCamera(35, 1, 0.05, 80)
  const pointer = new THREE.Vector2()
  const isTouch = window.matchMedia?.('(pointer: coarse)').matches ?? false

  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  } catch {
    options.onStatus('webgl-error')
    return () => { disposed = true }
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isTouch ? 1.5 : 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.domElement.setAttribute('aria-hidden', 'true')
  renderer.domElement.style.display = 'block'
  container.appendChild(renderer.domElement)

  scene.add(new THREE.HemisphereLight('#fff9ec', '#526875', 2.1))
  const key = new THREE.DirectionalLight('#fff1d1', 3.4)
  key.position.set(-4, 7, 8)
  scene.add(key)
  const rim = new THREE.DirectionalLight('#b5d7df', 1.25)
  rim.position.set(5, 3, -5)
  scene.add(rim)

  const tempBox = new THREE.Box3()
  const tempSize = new THREE.Vector3()
  const tempCenter = new THREE.Vector3()
  const clampProgress = () => THREE.MathUtils.clamp(Number(options.getProgress()) || 0, 0, 1)
  const smooth = (p: number, a: number, b: number) => THREE.MathUtils.smoothstep(p, a, b)

  function requestRender() {
    if (disposed || renderQueued) return
    renderQueued = true
    raf = requestAnimationFrame(() => {
      renderQueued = false
      if (!disposed) render()
    })
  }

  function setMaterialOpacity(materials: THREE.Material[], opacity: number) {
    for (const material of materials) {
      if (!originalOpacity.has(material)) originalOpacity.set(material, material.opacity)
      const transparent = opacity < .999 || material.transparent
      if (transparent !== material.transparent) { material.transparent = transparent; material.needsUpdate = true }
      material.opacity = (originalOpacity.get(material) ?? 1) * opacity
    }
  }

  function frameRoot(root: THREE.Object3D, targetSize: number) {
    root.updateWorldMatrix(true, true)
    tempBox.makeEmpty()
    root.traverseVisible(object => {
      const mesh = object as THREE.Mesh
      if (!mesh.geometry) return
      if (mesh instanceof THREE.InstancedMesh) {
        mesh.computeBoundingBox()
        if (mesh.boundingBox) tempBox.union(mesh.boundingBox.clone().applyMatrix4(mesh.matrixWorld))
      } else {
        if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox()
        if (mesh.geometry.boundingBox) tempBox.union(mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld))
      }
    })
    tempBox.getSize(tempSize)
    tempBox.getCenter(tempCenter)
    const largest = Math.max(tempSize.x, tempSize.y, tempSize.z, .001)
    const factor = targetSize / largest
    root.scale.multiplyScalar(factor)
    root.position.sub(tempCenter).multiplyScalar(factor)
    root.updateMatrixWorld(true)
  }

  function installCity() {
    connection = createConnection()
    city = connection.group.getObjectByName('quezon-city-symbolic-urban-garden') ?? undefined
    if (!city) throw new Error('Original Metro Manila city subtree was not found')
    connection.setProgress(.9, true)
    for (const child of [...connection.group.children]) {
      if (child !== city) child.visible = false
    }
    city.visible = true
    city.removeFromParent()
    const cityRoot = new THREE.Group()
    cityRoot.add(city)
    frameRoot(city, 3.2)
    cityBaseScale = cityRoot.scale.x
    city = cityRoot
    cityMaterials = []
    city.traverse(object => {
      const material = (object as THREE.Mesh).material
      if (material) (Array.isArray(material) ? material : [material]).forEach(m => cityMaterials.push(m))
    })
    scene.add(city)
  }

  function loadBouquet() {
    if (bouquet || bouquetRequest || disposed) return
    const request = ++bouquetRequest
    options.onStatus('loading-bouquet')
    new GLTFLoader().load('/bouquet_v4.glb', gltf => {
      if (disposed || request !== bouquetRequest) {
        disposeHierarchy(gltf.scene)
        return
      }
      bouquet = gltf.scene
      bouquet.name = 'retained-bouquet-v4'
      // The source includes a studio floor. Keep the authored flower materials and
      // geometry, but omit that floor so only the requested bouquet asset is visible.
      const floor = bouquet.getObjectByName('Studio_floor') ?? bouquet.getObjectByName('Studio floor')
      if (floor) { floor.removeFromParent(); disposeHierarchy(floor) }
      // Batch static source meshes by authored material without changing surfaces.
      bouquet = batchBouquet(bouquet)
      const bouquetRoot = new THREE.Group()
      bouquetRoot.add(bouquet)
      frameRoot(bouquet, 3.1)
      bouquet = bouquetRoot
      bouquetBaseScale = bouquet.scale.x
      bouquet.visible = false
      bouquetMaterials = []
      bouquetGeometries = []
      bouquet.traverse(object => {
        const mesh = object as THREE.Mesh
        if (mesh.geometry) bouquetGeometries.push(mesh.geometry)
        if (mesh.material) (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(m => bouquetMaterials.push(m))
      })
      scene.add(bouquet)
      options.onStatus('bouquet-ready')
      requestRender()
    }, undefined, () => {
      if (!disposed && request === bouquetRequest) options.onStatus('bouquet-error')
    })
  }

  function render() {
    const p = clampProgress()
    const reduced = options.getReducedMotion()
    const mobile = container.clientWidth < 640
    if (city) {
      const exit = smooth(p, .1, .24)
      const spatialExit = reduced ? 0 : exit
      city.visible = exit < 0.999
      city.position.x = (mobile ? 0 : 1.8) - spatialExit * (mobile ? .2 : 1.15)
      city.position.y = (mobile ? .3 : .05) + spatialExit * .25
      city.position.z = -spatialExit * 3
      city.rotation.y = THREE.MathUtils.lerp(.42, .24, spatialExit)
      city.scale.setScalar(cityBaseScale * (mobile ? .62 : .8) * THREE.MathUtils.lerp(1, .92, spatialExit))
      setMaterialOpacity(cityMaterials, 1 - exit)
    }
    if (p > .65) loadBouquet()
    if (bouquet) {
      const reveal = smooth(p, .85, 1)
      bouquet.visible = reveal > 0.001
      bouquet.position.x = mobile ? 0 : 1.8
      bouquet.position.y = mobile ? .3 : 0
      bouquet.position.z = 0
      bouquet.scale.setScalar(bouquetBaseScale * (mobile ? .62 : .85) * (reduced ? 1 : .88 + reveal * .12))
      bouquet.rotation.y = (isTouch || reduced ? 0 : pointer.x * .12) + (reduced ? 0 : Math.sin(reveal * Math.PI) * .035)
      bouquet.rotation.x = isTouch || reduced ? 0 : pointer.y * .045
      setMaterialOpacity(bouquetMaterials, reveal)
    }
    const travel = reduced ? 0 : smooth(p, .18, .82)
    camera.position.set(mobile ? 0 : .18 + travel * .12, mobile ? .55 + travel * .15 : .18, 7.8 - travel * .65)
    camera.lookAt(mobile ? 0 : .25, mobile ? .1 : 0, 0)
    const warmth = smooth(p, .72, .96)
    scene.background = new THREE.Color('#f1efe4').lerp(new THREE.Color('#f0e8db'), warmth)
    scene.fog = new THREE.Fog(scene.background as THREE.Color, 10, 32)
    // Publish projected bounds for real-browser framing regression checks.
    const visibleModel = bouquet?.visible ? bouquet : city?.visible ? city : undefined
    if (visibleModel) {
      scene.updateMatrixWorld(true)
      camera.updateMatrixWorld(true)
      tempBox.setFromObject(visibleModel)
      const projected = []
      for (const x of [tempBox.min.x, tempBox.max.x]) for (const y of [tempBox.min.y, tempBox.max.y]) for (const z of [tempBox.min.z, tempBox.max.z]) {
        const point = new THREE.Vector3(x, y, z).project(camera)
        projected.push({ x: point.x, y: point.y })
      }
      container.dataset.modelBounds = JSON.stringify({ minX: Math.min(...projected.map(p => p.x)), maxX: Math.max(...projected.map(p => p.x)), minY: Math.min(...projected.map(p => p.y)), maxY: Math.max(...projected.map(p => p.y)) })
    }
    renderer.render(scene, camera)
    container.dataset.drawCalls = String(renderer.info.render.calls)
  }

  function resize() {
    if (disposed) return
    const width = Math.max(1, container.clientWidth)
    const height = Math.max(1, container.clientHeight)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height, false)
    requestRender()
  }

  function onPointerMove(event: PointerEvent) {
    if (isTouch || options.getReducedMotion()) return
    const rect = renderer.domElement.getBoundingClientRect()
    pointer.x = THREE.MathUtils.clamp((event.clientX - rect.left) / rect.width * 2 - 1, -1, 1)
    pointer.y = THREE.MathUtils.clamp((event.clientY - rect.top) / rect.height * 2 - 1, -1, 1)
    requestRender()
  }

  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(container)
  renderer.domElement.addEventListener('pointermove', onPointerMove, { passive: true })
  // JourneyExperience owns the GSAP scrub; this event is the renderer's
  // on-demand invalidation boundary (no animation loop while scroll is idle).
  const onJourneyProgress = () => requestRender()
  container.addEventListener('journey-progress', onJourneyProgress)
  renderer.domElement.addEventListener('webglcontextlost', event => {
    event.preventDefault()
    options.onStatus('webgl-error')
  })
  resize()
  try {
    options.onStatus('loading-city')
    installCity()
    options.onStatus('ready')
    requestRender()
  } catch {
    options.onStatus('city-error')
  }

  return () => {
    if (disposed) return
    disposed = true
    bouquetRequest++
    if (raf) cancelAnimationFrame(raf)
    resizeObserver.disconnect()
    container.removeEventListener('journey-progress', onJourneyProgress)
    renderer.domElement.removeEventListener('pointermove', onPointerMove)
    connection?.dispose()
    if (city) disposeHierarchy(city)
    if (bouquet) disposeHierarchy(bouquet)
    renderer.dispose()
    renderer.domElement.remove()
  }
}

function batchBouquet(source: THREE.Group): THREE.Group {
  source.updateMatrixWorld(true)
  const buckets = new Map<THREE.Material, THREE.BufferGeometry[]>()
  const originals = new Set<THREE.BufferGeometry>()
  let compatible = true
  source.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return
    if ((Array.isArray(object.material) && object.material.length !== 1) || object instanceof THREE.SkinnedMesh) { compatible = false; return }
    const material = Array.isArray(object.material) ? object.material[0] : object.material
    const geometry = object.geometry.clone().applyMatrix4(object.matrixWorld)
    geometry.clearGroups()
    if (!geometry.getAttribute('uv')) geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(geometry.getAttribute('position').count * 2), 2))
    const bucket = buckets.get(material) ?? []
    bucket.push(geometry)
    buckets.set(material, bucket)
    originals.add(object.geometry)
  })
  const output = new THREE.Group()
  output.name = source.name
  if (compatible) {
    for (const [material, geometries] of buckets) {
      const merged = mergeGeometries(geometries, false)
      if (!merged) { compatible = false; break }
      output.add(new THREE.Mesh(merged, material))
    }
  }
  buckets.forEach(geometries => geometries.forEach(geometry => geometry.dispose()))
  if (!compatible) {
    output.traverse(object => { if (object instanceof THREE.Mesh) object.geometry.dispose() })
    return source
  }
  originals.forEach(geometry => geometry.dispose())
  return output
}

function disposeHierarchy(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>()
  const materials = new Set<THREE.Material>()
  const textures = new Set<THREE.Texture>()
  root.traverse(object => {
    const mesh = object as THREE.Mesh
    if (mesh.geometry) geometries.add(mesh.geometry)
    if (mesh.material) (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(material => {
      materials.add(material)
      Object.values(material).forEach(value => { if (value instanceof THREE.Texture) textures.add(value) })
    })
  })
  geometries.forEach(geometry => geometry.dispose())
  textures.forEach(texture => texture.dispose())
  materials.forEach(material => material.dispose())
}
