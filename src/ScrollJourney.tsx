import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import './scroll-journey.css'

type Chapter = { id: string; range: [number, number]; location?: string; title: string; body: string }
const chapters: Chapter[] = [
  { id: 'origin', range: [0, .2], location: 'Metro Manila, Philippines', title: 'From where I am…', body: 'A little journey to where you are.' },
  { id: 'north', range: [.2, .45], location: 'Northbound', title: 'Every mile brings me closer.', body: 'The city falls behind. The road opens, and the horizon keeps changing.' },
  { id: 'baguio', range: [.45, .65], location: 'Baguio, Philippines', title: 'Where you chase your dreams.', body: 'A little closer to the world you’re building.' },
  { id: 'union', range: [.65, .85], location: 'La Union, Philippines', title: 'And finally, closer to you.', body: 'The mountains soften into sea air. This is where you are now.' },
  { id: 'flowers', range: [.85, 1], location: 'A little something for you', title: 'These are for you.', body: 'Until I can give you flowers in person, I made these for you.' },
]

function chapterAt(progress: number) {
  return chapters.find(chapter => progress >= chapter.range[0] && progress <= chapter.range[1]) ?? chapters.at(-1)!
}

function makeCity() {
  const group = new THREE.Group()
  group.name = 'metro-manila-origin'
  const material = new THREE.MeshStandardMaterial({ color: '#a9b8b1', roughness: .86 })
  const dark = new THREE.MeshStandardMaterial({ color: '#637c76', roughness: .8 })
  const ground = new THREE.Mesh(new THREE.CircleGeometry(7, 64), new THREE.MeshStandardMaterial({ color: '#d9dfd5', roughness: 1 }))
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -.12
  group.add(ground)
  const buildings = [
    [-3, .7, -2, 1.4, 1.4, 1.7], [-1.2, 1.3, -2, 1.1, 2.6, 1.2], [.4, .55, -2.2, 1.6, 1.1, 1.5], [2, 1.8, -1.8, 1.2, 3.6, 1.2],
    [-2.4, .8, .2, 1.8, 1.6, 1.5], [-.4, .65, .3, 1.4, 1.3, 1.8], [1.4, .9, .4, 1.5, 1.8, 1.6], [3, .5, .6, 1, 1, 1.2],
    [-1.8, .5, 2.3, 2, 1, 1.3], [.6, 1.1, 2.2, 1.2, 2.2, 1.3], [2.5, .65, 2.3, 1.6, 1.3, 1.1],
  ]
  buildings.forEach(([x, y, z, sx, sy, sz], index) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), index % 4 === 0 ? dark : material)
    mesh.position.set(x, y / 2, z)
    mesh.castShadow = true
    group.add(mesh)
  })
  return group
}

export default function ScrollJourney() {
  const host = useRef<HTMLDivElement>(null)
  const bouquetRef = useRef<THREE.Group | undefined>(undefined)
  const bouquetBaseScale = useRef(1)
  const cityRef = useRef<THREE.Group | undefined>(undefined)
  const progressRef = useRef(0)
  const [progress, setProgress] = useState(0)
  const reduced = useRef(false)

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const section = document.getElementById('journey')
    if (!section) return
    const proxy = { progress: 0 }
    const update = () => {
      const value = THREE.MathUtils.clamp(proxy.progress, 0, 1)
      progressRef.current = value
      setProgress(value)
    }
    gsap.registerPlugin(ScrollTrigger)
    const context = gsap.context(() => {
      section.style.display = 'block'
      gsap.to(proxy, { progress: 1, ease: 'none', scrollTrigger: {
        trigger: section, start: 'top top', end: '+=500%', pin: section, pinSpacing: true, anticipatePin: 1, scrub: reduced.current ? true : .35, invalidateOnRefresh: true,
      }, onUpdate: update })
    }, section)
    update()
    return () => {
      context.revert()
      section.style.display = ''
    }
  }, [])


  useEffect(() => {
    const container = host.current
    if (!container) return
    let renderer: THREE.WebGLRenderer
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }) } catch { container.dataset.webglFailed = 'true'; return }
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(36, 1, .1, 100)
    camera.position.set(10, 7, 12)
    const light = new THREE.HemisphereLight('#fffdf4', '#6d817b', 2.2)
    scene.add(light)
    const sun = new THREE.DirectionalLight('#fff1d4', 3)
    sun.position.set(7, 12, 8); scene.add(sun)
    const city = makeCity(); cityRef.current = city; scene.add(city)
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshBasicMaterial({ color: '#dfe9e1', transparent: true, opacity: .35 }))
    ground.rotation.x = -Math.PI / 2; ground.position.y = -.2; scene.add(ground)
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6)); renderer.outputColorSpace = THREE.SRGBColorSpace; container.appendChild(renderer.domElement)
    const resize = () => { const { width, height } = container.getBoundingClientRect(); renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix() }
    resize(); window.addEventListener('resize', resize)
    let loaded = false
    const loadBouquet = async () => {
      try {
        const gltf = await new GLTFLoader().loadAsync('/bouquet_v4.glb')
        const model = gltf.scene; model.name = 'custom-bouquet-v4'; model.visible = false
        const box = new THREE.Box3().setFromObject(model); const size = box.getSize(new THREE.Vector3()); const max = Math.max(size.x, size.y, size.z) || 1
        model.scale.setScalar(4 / max); bouquetBaseScale.current = model.scale.x; model.position.set(0, 0, -2.8); bouquetRef.current = model; scene.add(model); loaded = true
      } catch { /* the HTML conclusion remains usable if the optional model fails */ }
    }
    void loadBouquet()
    let frame = 0
    const draw = () => {
      frame = requestAnimationFrame(draw)
      const p = progressRef.current
  const originFade = 1 - THREE.MathUtils.smoothstep(p, .1, .22)
      if (cityRef.current) { cityRef.current.visible = originFade > 0; cityRef.current.position.z = -p * 9; cityRef.current.position.y = p * .35; cityRef.current.rotation.y = p * .08; cityRef.current.traverse(object => { if (object instanceof THREE.Mesh) { const material = Array.isArray(object.material) ? object.material : [object.material]; material.forEach(item => { item.transparent = true; item.opacity = originFade }) } }) }
      const road = THREE.MathUtils.smoothstep(p, .18, .48)
      camera.position.set(10 - road * 6, 7 + road * 2 + p * 1.5, 12 - p * 27)
      camera.lookAt(0, p > .8 ? 1 : 1.3, -p * 23)
      const bouquetReveal = THREE.MathUtils.smoothstep(p, .78, .94)
      if (bouquetRef.current) {
        bouquetRef.current.visible = loaded && bouquetReveal > 0
        bouquetRef.current.scale.setScalar(bouquetBaseScale.current * (.18 + bouquetReveal * .82))
        bouquetRef.current.position.set(.2, bouquetReveal * .2, -25 + bouquetReveal * 2)
        bouquetRef.current.rotation.y = Math.sin(p * Math.PI) * .06
      }
      renderer.render(scene, camera)
    }
    draw()
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      renderer.dispose()
      if (renderer.domElement.parentElement === container) container.removeChild(renderer.domElement)
      const dispose = new Set<THREE.BufferGeometry | THREE.Material>()
      scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
          dispose.add(object.geometry)
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          materials.forEach(material => dispose.add(material))
        }
      })
      dispose.forEach(resource => resource.dispose())
    }
  }, [])

  const chapter = chapterAt(progress)
  const mountainWeight = THREE.MathUtils.smoothstep(progress, .38, .48) * (1 - THREE.MathUtils.smoothstep(progress, .70, .78))
  const coastWeight = THREE.MathUtils.smoothstep(progress, .60, .68) * (1 - THREE.MathUtils.smoothstep(progress, .88, .96))
  const travelWeight = THREE.MathUtils.smoothstep(progress, .16, .28) * (1 - THREE.MathUtils.smoothstep(progress, .82, .92))
  const stageStyle = {
    '--journey-progress': progress,
    '--mountain-weight': mountainWeight,
    '--coast-weight': coastWeight,
    '--travel-weight': travelWeight,
    '--mountain-parallax': `${(0.5 - progress) * 8}vh`,
    '--coast-parallax': `${(0.5 - progress) * 7}vh`,
    '--sky-warmth': `${1 - mountainWeight * .45}`,
  } as React.CSSProperties
  const restart = () => {
    const section = document.getElementById('journey')
    if (!section) return
    const trigger = ScrollTrigger.getAll().find(item => item.trigger === section)
    window.scrollTo({ top: trigger?.start ?? section.offsetTop, behavior: 'auto' })
  }
  return <section id="journey" className="journey" aria-label="A scroll-driven journey" style={stageStyle}>
    <div className="journey-sticky">
      <div ref={host} className="journey-canvas" aria-label="Interactive cinematic journey from Metro Manila toward Baguio and La Union" role="img" />
      <div className="journey-atmosphere" aria-hidden="true" data-mountains={mountainWeight.toFixed(3)} data-coast={coastWeight.toFixed(3)}><span className="journey-sky" /><span className="journey-horizon" /><span className="journey-ridge journey-ridge--far" /><span className="journey-ridge journey-ridge--near" /><span className="journey-pines" /><span className="journey-mist" /><span className="journey-coast" /><span className="journey-travel-line" /></div>
      <div className="journey-copy" key={chapter.id}>
        {chapter.location && <span className="journey-location">{chapter.location}</span>}
        <h1>{chapter.title}</h1><p>{chapter.body}</p>
      </div>
      <div className="journey-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} aria-label="Journey progress"><span style={{ transform: `scaleX(${progress})` }} /></div>
      <span className="journey-scroll-hint">{progress < .98 ? 'Scroll to travel' : 'You made it here'}</span>
      {progress >= .84 && <button className="journey-restart" onClick={restart}>Restart the journey</button>}
    </div>
    <nav className="journey-chapters" aria-label="Journey chapters">{chapters.map(chapter => <a key={chapter.id} href="#journey" onClick={event => { event.preventDefault(); const section = document.getElementById('journey'); const trigger = ScrollTrigger.getAll().find(item => item.trigger === section); if (!section) return; const top = section.getBoundingClientRect().top + window.scrollY; window.scrollTo({ top: (trigger?.start ?? top) + section.clientHeight * ((chapter.range[0] + chapter.range[1]) / 2), behavior: 'auto' }) }}>{chapter.location ?? chapter.id}</a>)}</nav>
    <div className="journey-accessible"><h2>The route</h2><p>From Metro Manila, through Baguio where she studies nursing, toward La Union where she is now.</p><a href="#about">Skip to the rest of her space</a></div>
  </section>
}
