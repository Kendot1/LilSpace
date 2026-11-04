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
  const homeLook = new T.Vector3(0, 2, -7)
  const look = homeLook.clone()
  camera.position.copy(home)
  let model = createWorld('coast', invalidate)
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
  let pageTimeline: gsap.core.Tween | undefined
  const cancelPage = () => { pageTimeline?.kill(); pageTimeline = undefined; model.turnMemoryPage(1, 1) }
  const setHome = () => {
    const mobile = host.clientWidth < 600
    home.set(mobile ? 10 : 8, mobile ? 9 : 6.5, mobile ? 17 : 12)
    homeLook.set(0, world === 'mountain' ? 4 : world === 'coast' ? 2 : .8, world === 'mountain' ? -18 : world === 'coast' ? -7 : 0)
  }
  let transition: gsap.core.Timeline | undefined
  let pendingSwap: (() => void) | undefined
  let pendingWorld: World | undefined, pendingJourney: number | undefined
  const cancelTransition = () => {
    transition?.kill(); transition = undefined; pendingSwap = undefined; pendingWorld = undefined; pendingJourney = undefined
    renderer.domElement.style.opacity = '1'
  }
  const finishTransition = () => {
    const swap = pendingSwap
    transition?.kill(); transition = undefined
    renderer.domElement.style.opacity = '1'
    swap?.()
    pendingSwap = undefined; pendingWorld = undefined; pendingJourney = undefined
    busy = false
  }
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
    fog.color.copy(scene.background as T.Color); fog.density=world === 'mountain' ? .007 : atmosphere.fog
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
      scene.remove(model.group);model.dispose();model=createWorld(destination, invalidate);scene.add(model.group);prepareTargets();world=destination
    }
    host.dataset.world = world
    delete host.dataset.connectionProgress
    restoreAtmosphere()
    model.openGift(0); model.inspect(undefined,0); host.dataset.gift = 'closed'; host.dataset.giftProgress = '0'
    delete host.dataset.camera
    setHome(); camera.position.copy(home); look.copy(homeLook)
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
  function invalidate() {
    if (active && !document.hidden && !disposed) render(performance.now())
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
    // A projection change moves screen-space targets even if the pose is unchanged.
    delete host.dataset.camera
    setHome()
    if (storyOwned) applyStoryPose()
    else if (!busy) { camera.position.copy(home); look.copy(homeLook) }
    render(performance.now())
  })
  resize.observe(host)
  const observer = new IntersectionObserver(entries => { active = entries[0].isIntersecting; sync() }, { rootMargin: '80px' })
  observer.observe(host)
  const focus = (id: WorldAction) => {
    cancelPage()
    endStory()
    if (pendingSwap) finishTransition(); else cancelTransition()
    timeline?.kill(); arrival.value=1; restoreAtmosphere(); busy = false
    const target = model.targets.find(item => item.id === id)
    if (!target) return
    target.object.getWorldPosition(aim)
    gsap.killTweensOf([camera.position, look])
    if (reduced.matches) { look.copy(aim); camera.position.copy(aim).add(new T.Vector3(4, 3, 6)); render(performance.now()) }
    else { gsap.to(look, { x: aim.x, y: aim.y, z: aim.z, duration: .9 }); gsap.to(camera.position, { x: aim.x + 4, y: aim.y + 3, z: aim.z + 6, duration: .9, ease: 'power2.inOut' }) }
    model.openGift(0)
    model.inspect(undefined,0)
    if (reduced.matches) { model.inspect(id,1); render(performance.now()) }
    else if (id === 'book' || id === 'memories' || id === 'letter') {
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
  const canvas = renderer.domElement
  // Capture one primary pointer so a drag remains continuous outside the canvas.
  canvas.style.touchAction = 'none'
  let gesture: { id: number; startX: number; startY: number; x: number; y: number; dragged: boolean } | undefined
  let suppressClick = false
  const orbit = new T.Spherical(), offset = new T.Vector3()
  const down = (e: PointerEvent) => {
    if (storyOwned || busy || !e.isPrimary || e.button !== 0 || gesture) return
    suppressClick = false
    gesture = { id: e.pointerId, startX: e.clientX, startY: e.clientY, x: e.clientX, y: e.clientY, dragged: false }
    canvas.setPointerCapture(e.pointerId)
  }
  const move = (e: PointerEvent) => {
    if (gesture && gesture.id === e.pointerId) {
      if (storyOwned || busy) { suppressClick = true; gesture = undefined; return }
      if (!gesture.dragged && Math.hypot(e.clientX - gesture.startX, e.clientY - gesture.startY) >= 6) {
        gesture.dragged = true
        gsap.killTweensOf([camera.position, look])
      }
      if (gesture.dragged) {
        orbit.setFromVector3(offset.copy(camera.position).sub(look))
        orbit.theta -= (e.clientX - gesture.x) * .004
        orbit.phi = T.MathUtils.clamp(orbit.phi - (e.clientY - gesture.y) * .004, .55, 1.3)
        camera.position.copy(offset.setFromSpherical(orbit).add(look))
        render(performance.now())
      }
      gesture.x = e.clientX; gesture.y = e.clientY
      host.style.cursor = gesture.dragged ? 'grabbing' : 'grab'
    } else if (e.pointerType !== 'touch') host.style.cursor = storyOwned ? 'default' : hit(e) ? 'pointer' : 'grab'
  }
  const up = (e: PointerEvent) => {
    if (!gesture || gesture.id !== e.pointerId) return
    suppressClick = gesture.dragged || e.type === 'pointercancel'
    gesture = undefined
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId)
    host.style.cursor = storyOwned ? 'default' : 'grab'
  }
  const click = (e: PointerEvent) => {
    if (suppressClick) { suppressClick = false; return }
    if (storyOwned || busy) return
    const target = hit(e); if (target) focus(target.id)
  }
  const lost = (e: Event) => { e.preventDefault(); renderer.setAnimationLoop(null); onFailure() }
  const reset = () => {
    cancelPage()
    endStory()
    if (pendingSwap) finishTransition(); else cancelTransition()
    timeline?.kill(); gsap.killTweensOf([camera.position, look]); arrival.value=1; restoreAtmosphere(); busy = false
    model.openGift(0); model.inspect(undefined,0); host.dataset.gift = 'closed'
    gsap.to(camera.position, { x: home.x, y: home.y, z: home.z, duration: reduced.matches ? 0 : 1, onUpdate: () => { if (reduced.matches) render(performance.now()) } })
    gsap.to(look, { x: homeLook.x, y: homeLook.y, z: homeLook.z, duration: reduced.matches ? 0 : 1, onUpdate: () => { if (reduced.matches) render(performance.now()) } })
    sync()
  }
  const changeWorld = (next: World, scrub = false) => {
    cancelPage()
    transition?.kill(); transition = undefined; pendingSwap = undefined; pendingWorld = undefined; pendingJourney = undefined
    timeline?.kill(); gsap.killTweensOf([camera.position, look]); busy = true
    const swap = () => {
      scene.remove(model.group); model.dispose(); model = createWorld(next, invalidate); scene.add(model.group); prepareTargets()
      world = next; host.dataset.world = world; host.dataset.gift = 'closed'
      delete host.dataset.camera
      scene.background = new T.Color(skies[next]); (scene.fog as T.FogExp2).color.set(skies[next])
      setHome(); look.copy(homeLook); camera.position.copy(home).multiplyScalar(1.18)
    }
    if (scrub || reduced.matches) { renderer.domElement.style.opacity='1'; swap(); arrival.value=1; restoreAtmosphere(); camera.position.copy(home); busy = false; render(performance.now()) }
    else {
      pendingWorld = next
      pendingSwap = () => {
        swap(); arrival.value=1; restoreAtmosphere(); camera.position.copy(home)
        const progress = pendingJourney; pendingJourney = undefined; pendingSwap = undefined; pendingWorld = undefined
        if (progress !== undefined) travel(progress)
        render(performance.now())
      }
      transition = gsap.timeline({onComplete:()=>{busy=false; transition=undefined}})
        .to(renderer.domElement,{opacity:0,duration:.45,ease:'power2.inOut'})
        .call(() => pendingSwap?.())
        .to(renderer.domElement,{opacity:1,duration:.65,ease:'power2.inOut'})
    }
  }
  const change = (next: World) => {
    endStory()
    const origin = world
    const progress = origin === 'journey' ? Number(host.dataset.journeyProgress || 0) : origin === 'mountain' ? 1 : 0
    const corridor = (origin === 'coast' || origin === 'journey' || origin === 'mountain') && (next === 'coast' || next === 'journey' || next === 'mountain')
    if (!corridor || reduced.matches || next === 'journey') { changeWorld(next, next === 'journey'); if (next === 'journey') travel(0); return }
    // The road is continuous, but its destination model uses a different
    // composition. Fade that final exchange rather than cutting abruptly.
    changeWorld('journey', true)
    const state = { value: progress }
    const target = next === 'mountain' ? 1 : 0
    const apply = () => {
      const atmosphere = sampleJourney(state.value, camera.position, look, scene.background as T.Color, sun.color, host.clientWidth < 600)
      const fog = scene.fog as T.FogExp2
      fog.color.copy(scene.background as T.Color); fog.density = atmosphere.fog; sun.intensity = atmosphere.intensity
      host.dataset.journeyProgress = String(state.value)
      render(performance.now())
    }
    apply()
    pendingWorld = next
    pendingSwap = () => changeWorld(next, false)
    busy = true
    transition = gsap.timeline({ onComplete: () => { const finish = pendingSwap; pendingSwap = undefined; pendingWorld = undefined; transition = undefined; finish?.() } })
      .to(state, { value: target, duration: Math.max(.5, Math.abs(target - progress) * 3.5), ease: 'power1.inOut', onUpdate: apply })
  }
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
      cancelPage()
      cancelTransition()
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
    else if (reduced.matches) { if (pendingSwap) finishTransition(); else cancelTransition(); timeline?.progress(1); pageTimeline?.progress(1); gsap.killTweensOf([camera.position, look]); }
    sync()
  }
  document.addEventListener('visibilitychange', sync)
  reduced.addEventListener('change', preference)
  canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move)
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up); canvas.addEventListener('lostpointercapture', up)
  canvas.addEventListener('click', click)
  renderer.domElement.addEventListener('webglcontextlost', lost)
  host.dataset.world = world; sync()
  const travel=(progress:number)=>{
    endStory()
    if (pendingWorld === 'journey') { pendingJourney = progress; return }
    if(world!=='journey')changeWorld('journey',true)
    timeline?.kill();gsap.killTweensOf([camera.position,look]);busy=false
    const atmosphere=sampleJourney(progress,camera.position,look,scene.background as T.Color,sun.color,host.clientWidth < 600)
    const fog=scene.fog as T.FogExp2;fog.color.copy(scene.background as T.Color);fog.density=atmosphere.fog;sun.intensity=atmosphere.intensity
    host.dataset.journeyProgress=String(T.MathUtils.clamp(progress,0,1))
    render(performance.now())
  }
  const turnMemoryPage = (direction: 1 | -1) => {
    cancelPage()
    host.dataset.pageDirection = String(direction)
    const state = { progress: 0 }
    const update = () => { model.turnMemoryPage(direction, state.progress); host.dataset.pageProgress = String(state.progress); render(performance.now()) }
    if (reduced.matches) { state.progress = 1; update(); return }
    update()
    pageTimeline = gsap.to(state, { progress: 1, duration: .8, ease: 'power2.inOut', onUpdate: update, onComplete: () => { pageTimeline = undefined } })
  }
  return { change, focus, reset, story, endStory, travel, turnMemoryPage, rotate: (direction: number) => {
    endStory()
    const angle = direction * .25, x = camera.position.x, z = camera.position.z
    gsap.to(camera.position, { x: x * Math.cos(angle) + z * Math.sin(angle), z: z * Math.cos(angle) - x * Math.sin(angle), duration: reduced.matches ? 0 : .5, onUpdate: () => { if (reduced.matches) render(performance.now()) } })
  }, dispose: () => {
    cancelPage()
    cancelTransition()
    disposed = true; renderer.setAnimationLoop(null); timeline?.kill(); gsap.killTweensOf([camera.position, look])
    resize.disconnect(); observer.disconnect(); reduced.removeEventListener('change', preference)
    document.removeEventListener('visibilitychange', sync)
    if (gesture && canvas.hasPointerCapture(gesture.id)) canvas.releasePointerCapture(gesture.id)
    gesture = undefined
    canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move)
    canvas.removeEventListener('pointerup', up); canvas.removeEventListener('pointercancel', up); canvas.removeEventListener('lostpointercapture', up)
    canvas.removeEventListener('click', click); host.style.cursor = ''
    renderer.domElement.removeEventListener('webglcontextlost', lost)
    connection?.dispose(); model.dispose(); scene.environment=null; reflection.dispose(); pickGeometry.dispose(); pickMaterial.dispose(); renderer.dispose(); renderer.domElement.remove()
  } }
}
