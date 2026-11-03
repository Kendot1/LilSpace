import * as T from 'three'
import { gsap } from 'gsap'
import { createConnection } from './createConnection'
import { sampleStoryCamera } from './story-camera'
import { sampleJourney } from './journey-camera'
import { bakeReflectionEnvironment } from './reflection-environment'
import { sampleWorldAtmosphere } from './world-atmosphere'
import { createWorld, type World, type WorldAction } from './createWorld'

const skies: Record<World, string> = { coast: '#c9e2e1', journey: '#ccdad5', mountain: '#c7d8db', 'little-space': '#d8dfd0' }

/** One renderer and one animation owner, shared by all destinations. */
export function mountWorld(host: HTMLDivElement, onSelect: (id: WorldAction) => void, onReveal: () => void, onFailure: () => void) {
  const renderer = new T.WebGLRenderer({ antialias: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))
  renderer.outputColorSpace = T.SRGBColorSpace
  renderer.toneMapping = T.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.15
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = T.PCFSoftShadowMap
  host.appendChild(renderer.domElement)
  const scene = new T.Scene()
  const reflection=bakeReflectionEnvironment(renderer)
  scene.environment=reflection.texture;scene.environmentIntensity=.32
  scene.background = new T.Color(skies.coast)
  scene.fog = new T.FogExp2(skies.coast, .023)
  scene.add(new T.HemisphereLight('#fff6e1', '#617f79', 2.4))
  const sun = new T.DirectionalLight('#fff0ce', 3)
  sun.position.set(-7, 12, 8)
  sun.castShadow = true
  sun.shadow.mapSize.set(1024, 1024)
  Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 40 })
  sun.shadow.bias = -.001
  scene.add(sun)
  const camera = new T.PerspectiveCamera(43, 1, .1, 100)
  const home = new T.Vector3(8, 6.5, 12)
  const look = new T.Vector3(0, .8, 0)
  camera.position.copy(home)
  let model = createWorld('coast')
  scene.add(model.group)
  // Generous invisible pick volumes make small keepsakes selectable on touch screens.
  const pickMaterial = new T.MeshBasicMaterial({ visible: false })
  const pickGeometry = new T.BoxGeometry(1, 1, 1)
  const prepareTargets = () => {
    model.group.updateMatrixWorld(true)
    for (const target of model.targets) {
      const bounds = new T.Box3().setFromObject(target.object)
      const center = target.object.worldToLocal(bounds.getCenter(new T.Vector3()))
      const size = bounds.getSize(new T.Vector3())
      const proxy = new T.Mesh(pickGeometry, pickMaterial)
      proxy.name = 'touch-pick-volume'; proxy.position.copy(center)
      proxy.scale.set(Math.max(size.x, .8), Math.max(size.y, .6), Math.max(size.z, .8))
      target.object.add(proxy)
    }
  }
  prepareTargets()
  let world: World = 'coast', timeline: gsap.core.Timeline | undefined
  let active = true, disposed = false, busy = false, elapsed = 0, previous = performance.now()
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  let storyOwned = false, storyProgress = 0
  let connection: ReturnType<typeof createConnection> | undefined
  const storyWorlds: World[] = ['coast', 'journey', 'mountain', 'little-space']
  const arrival = { value: 1 }
  const connectionNight = new T.Color('#101e30'), connectionDusk = new T.Color('#263c48'), connectionSky = new T.Color()
  const pointer = new T.Vector2(), ray = new T.Raycaster(), aim = new T.Vector3()
  const restoreAtmosphere = () => {
    const fog = scene.fog as T.FogExp2
    const atmosphere=sampleWorldAtmosphere(world,arrival.value,scene.background as T.Color,sun.color)
    fog.color.copy(scene.background as T.Color); fog.density=atmosphere.fog
    sun.intensity=atmosphere.intensity
    scene.environmentIntensity=.32
  }
  const endStory = (): void => {
    if (!storyOwned) return
    storyOwned = false; busy = false
    host.dataset.storyActive = 'false'
    connection?.dispose(); connection = undefined; model.group.visible = true
    const destination=storyWorlds[Math.min(3,Math.floor(storyProgress*4))]
    if(world!==destination){
      scene.remove(model.group);model.dispose();model=createWorld(destination);scene.add(model.group);prepareTargets();world=destination
    }
    host.dataset.world = world
    delete host.dataset.connectionProgress
    restoreAtmosphere()
    model.openGift(0); model.inspect(undefined,0); host.dataset.gift = 'closed'; host.dataset.giftProgress = '0'
    delete host.dataset.camera
    camera.position.copy(home); look.set(0, .8, 0)
    render(performance.now())
  }
  const render = (now: number) => {
    const delta = Math.min((now - previous) / 1000, .05); previous = now
    if (!reduced.matches) elapsed += delta
    if (storyOwned) connection?.update(elapsed, delta, reduced.matches)
    else model.update(elapsed, delta, reduced.matches)
    camera.lookAt(look)
    renderer.render(scene, camera)
    const cameraStamp = camera.position.toArray().map(v => v.toFixed(2)).join(',')
    if (host.dataset.camera !== cameraStamp || host.dataset.world !== world) {
      host.dataset.targets = JSON.stringify(model.targets.map(target => {
        const center = new T.Box3().setFromObject(target.object).getCenter(new T.Vector3()).project(camera)
        return { id: target.id, x: (center.x + 1) / 2, y: (1 - center.y) / 2 }
      }))
    }
    host.dataset.camera = cameraStamp
    host.dataset.drawCalls = String(renderer.info.render.calls)
  }
  const sync = () => {
    const running = active && !document.hidden && !disposed
    renderer.setAnimationLoop(running && !reduced.matches ? render : null)
    previous = performance.now()
    if (running) render(previous)
  }
  const resize = new ResizeObserver(() => {
    const width = host.clientWidth, height = Math.max(host.clientHeight, 1)
    renderer.setSize(width, height)
    camera.aspect = width / height; camera.updateProjectionMatrix()
    home.set(width < 600 ? 10 : 8, width < 600 ? 9 : 6.5, width < 600 ? 17 : 12)
    if (storyOwned) applyStoryPose()
    else if (!busy) camera.position.copy(home)
    render(performance.now())
  })
  resize.observe(host)
  const observer = new IntersectionObserver(entries => { active = entries[0].isIntersecting; sync() }, { rootMargin: '80px' })
  observer.observe(host)
  const focus = (id: WorldAction) => {
    endStory()
    timeline?.kill(); arrival.value=1; restoreAtmosphere(); busy = false
    const target = model.targets.find(item => item.id === id)
    if (!target) return
    target.object.getWorldPosition(aim)
    gsap.killTweensOf([camera.position, look])
    if (reduced.matches) { look.copy(aim); camera.position.copy(aim).add(new T.Vector3(4, 3, 6)); render(performance.now()) }
    else { gsap.to(look, { x: aim.x, y: aim.y, z: aim.z, duration: .9 }); gsap.to(camera.position, { x: aim.x + 4, y: aim.y + 3, z: aim.z + 6, duration: .9, ease: 'power2.inOut' }) }
    model.openGift(0)
    model.inspect(undefined,0)
    if (reduced.matches) model.inspect(id,1)
    else if (id === 'book' || id === 'memories') {
      const inspection={value:0}
      timeline=gsap.timeline().to(inspection,{value:1,duration:1.1,ease:'power2.inOut',onUpdate:()=>model.inspect(id,inspection.value)})
    }
    onSelect(id)
    if (id === 'gift') {
      const opening = { value: 0 }; busy = true
      host.dataset.gift = 'opening'
      const finish = () => { busy = false; host.dataset.gift = 'open'; onReveal(); render(performance.now()) }
      if (reduced.matches) { model.openGift(1); finish() }
      else timeline = gsap.timeline().to(opening, { value: 1, duration: 2.2, delay: .6, ease: 'power2.inOut', onUpdate: () => model.openGift(opening.value), onComplete: finish })
    }
  }
  const hit = (event: PointerEvent) => {
    const box = host.getBoundingClientRect()
    pointer.set((event.clientX - box.left) / box.width * 2 - 1, -(event.clientY - box.top) / box.height * 2 + 1)
    ray.setFromCamera(pointer, camera)
    const intersection = ray.intersectObjects(model.targets.map(t => t.object), true)[0]
    if (!intersection) return undefined
    return model.targets.find(t => { let object: T.Object3D | null = intersection.object; while (object) { if (object === t.object) return true; object = object.parent } return false })
  }
  const move = (e: PointerEvent) => { host.style.cursor = storyOwned ? 'default' : hit(e) ? 'pointer' : 'grab' }
  const click = (e: PointerEvent) => { if (storyOwned) return; const target = hit(e); if (target) focus(target.id) }
  const lost = (e: Event) => { e.preventDefault(); renderer.setAnimationLoop(null); onFailure() }
  const reset = () => {
    endStory()
    timeline?.kill(); gsap.killTweensOf([camera.position, look]); arrival.value=1; restoreAtmosphere(); busy = false
    model.openGift(0); model.inspect(undefined,0); host.dataset.gift = 'closed'
    gsap.to(camera.position, { x: home.x, y: home.y, z: home.z, duration: reduced.matches ? 0 : 1, onUpdate: () => { if (reduced.matches) render(performance.now()) } })
    gsap.to(look, { x: 0, y: .8, z: 0, duration: reduced.matches ? 0 : 1 })
    sync()
  }
  const changeWorld = (next: World, scrub = false) => {
    timeline?.kill(); gsap.killTweensOf([camera.position, look]); busy = true
    const swap = () => {
      scene.remove(model.group); model.dispose(); model = createWorld(next); scene.add(model.group); prepareTargets()
      world = next; host.dataset.world = world; host.dataset.gift = 'closed'
      scene.background = new T.Color(skies[next]); (scene.fog as T.FogExp2).color.set(skies[next])
      look.set(0, .8, 0); camera.position.copy(home).multiplyScalar(1.18)
    }
    if (scrub) { swap(); arrival.value=1; restoreAtmosphere(); busy = false }
    else if (reduced.matches) { swap(); arrival.value=1; restoreAtmosphere(); camera.position.copy(home); busy = false; render(performance.now()) }
    else {
      swap(); arrival.value=0; restoreAtmosphere()
      timeline = gsap.timeline({onComplete:()=>{busy=false}})
        .to(arrival,{value:1,duration:1.4,ease:'power2.out',onUpdate:restoreAtmosphere},0)
        .to(camera.position,{x:home.x,y:home.y,z:home.z,duration:1.4,ease:'power2.out'},0)
    }
  }
  const change = (next: World) => { endStory(); changeWorld(next) }
  const applyStoryPose = () => {
    const chapter = Math.min(3, Math.floor(storyProgress * 4))
    const p = storyProgress
    if (!connection) { connection = createConnection(); scene.add(connection.group) }
    model.group.visible = false
    connection.setProgress(p, reduced.matches)
    const fog = scene.fog as T.FogExp2
    const sky = connectionSky.copy(connectionNight).lerp(connectionDusk, T.MathUtils.smoothstep(p, .55, 1))
    fog.color.copy(sky); fog.density = .012; (scene.background as T.Color).copy(sky)
    sun.color.set('#ffd9a1'); sun.intensity = 2.1
    scene.environmentIntensity=.12
    sampleStoryCamera(p, host.clientWidth < 700, reduced.matches, camera.position, look)
    host.dataset.world = storyWorlds[chapter]
    host.dataset.storyProgress = String(p)
    host.dataset.storyChapter = String(chapter)
    host.dataset.connectionProgress = String(T.MathUtils.smoothstep(p, .2, .65))
    host.dataset.loversDistance = String(connection.male.position.distanceTo(connection.female.position))
    host.dataset.look = look.toArray().join(',')
  }
  const story = (progress: number): void => {
    if (disposed) return
    if (!storyOwned) {
      timeline?.kill(); timeline = undefined
      gsap.killTweensOf([camera.position, look]); busy = false
      storyOwned = true; host.dataset.storyActive = 'true'; host.style.cursor = 'default'
    }
    storyProgress = Number.isNaN(progress) ? 0 : T.MathUtils.clamp(progress, 0, 1)
    applyStoryPose()
    render(performance.now())
  }
  const preference = () => {
    if (storyOwned) applyStoryPose()
    else if (reduced.matches) { timeline?.progress(1); gsap.killTweensOf([camera.position, look]); }
    sync()
  }
  document.addEventListener('visibilitychange', sync)
  reduced.addEventListener('change', preference)
  host.addEventListener('pointermove', move); host.addEventListener('click', click)
  renderer.domElement.addEventListener('webglcontextlost', lost)
  host.dataset.world = world; sync()
  const travel=(progress:number)=>{
    endStory()
    if(world!=='journey')changeWorld('journey',true)
    timeline?.kill();gsap.killTweensOf([camera.position,look]);busy=false
    const atmosphere=sampleJourney(progress,camera.position,look,scene.background as T.Color,sun.color)
    const fog=scene.fog as T.FogExp2;fog.color.copy(scene.background as T.Color);fog.density=atmosphere.fog;sun.intensity=atmosphere.intensity
    host.dataset.journeyProgress=String(T.MathUtils.clamp(progress,0,1))
    render(performance.now())
  }
  return { change, focus, reset, story, endStory, travel, rotate: (direction: number) => {
    endStory()
    const angle = direction * .25, x = camera.position.x, z = camera.position.z
    gsap.to(camera.position, { x: x * Math.cos(angle) + z * Math.sin(angle), z: z * Math.cos(angle) - x * Math.sin(angle), duration: reduced.matches ? 0 : .5, onUpdate: () => { if (reduced.matches) render(performance.now()) } })
  }, dispose: () => {
    disposed = true; renderer.setAnimationLoop(null); timeline?.kill(); gsap.killTweensOf([camera.position, look])
    resize.disconnect(); observer.disconnect(); reduced.removeEventListener('change', preference)
    document.removeEventListener('visibilitychange', sync); host.removeEventListener('pointermove', move); host.removeEventListener('click', click)
    renderer.domElement.removeEventListener('webglcontextlost', lost)
    connection?.dispose(); model.dispose(); scene.environment=null; reflection.dispose(); pickGeometry.dispose(); pickMaterial.dispose(); renderer.dispose(); renderer.domElement.remove()
  } }
}
