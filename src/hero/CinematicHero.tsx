import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { heroStages, lerpCameraStage } from './scroll-stages'
import { useScrollStages } from './useScrollStages'
import { createDetailedHouse } from './DetailedHouse'
import { createHeroEnvironment } from './DetailedEnvironment'
import './CinematicHero.css'

export default function CinematicHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | undefined>(undefined)
  const sceneRef = useRef<THREE.Scene | undefined>(undefined)
  const cameraRef = useRef<THREE.PerspectiveCamera | undefined>(undefined)
  const targetCamera = useRef({ stage: 0, progress: 0 })
  const parallaxTarget = useRef(new THREE.Vector2())
  const [isReady, setIsReady] = useState(false)
  const disposeRef = useRef<(() => void)[]>([])

  const { containerRef, state, goToStage } = useScrollStages({
    stageCount: heroStages.length,
    scrollSensitivity: 800,
    momentumDamping: 0.85,
    onStageChange: (stage) => {
      console.log('Stage changed to:', stage)
    }
  })

  useEffect(() => {
    targetCamera.current = { stage: state.currentStage, progress: state.progress }
  }, [state.currentStage, state.progress])

  // Initialize Three.js scene
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    rendererRef.current = renderer

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#d4e4e0')
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    )
    camera.position.copy(heroStages[0].camera.position)
    camera.lookAt(heroStages[0].camera.lookAt)
    cameraRef.current = camera

    // Lighting
    const ambientLight = new THREE.HemisphereLight('#ffffff', '#8b9b7a', 1.8)
    scene.add(ambientLight)

    const sunLight = new THREE.DirectionalLight('#fff5e6', 2.5)
    sunLight.position.set(20, 30, 15)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.set(2048, 2048)
    sunLight.shadow.camera.left = -30
    sunLight.shadow.camera.right = 30
    sunLight.shadow.camera.top = 30
    sunLight.shadow.camera.bottom = -30
    sunLight.shadow.camera.near = 10
    sunLight.shadow.camera.far = 80
    sunLight.shadow.bias = -0.0005
    scene.add(sunLight)

    // Build environment
    const environment = createHeroEnvironment()
    scene.add(environment.terrain)
    environment.trees.forEach(tree => scene.add(tree))
    environment.flowers.forEach(flower => scene.add(flower))
    scene.add(environment.atmosphere.clouds)
    scene.fog = environment.atmosphere.fog
    disposeRef.current.push(environment.dispose)

    // Add detailed house
    const house = createDetailedHouse({
      position: new THREE.Vector3(0, 0, -2),
      rotation: 0,
      scale: 1
    })
    scene.add(house)
    if (house.userData.dispose) {
      disposeRef.current.push(house.userData.dispose)
    }

    // Cursor parallax
    let mouseX = 0
    let mouseY = 0

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1
      parallaxTarget.current.set(mouseX, mouseY)
    }

    window.addEventListener('mousemove', handleMouseMove)

    // Handle resize
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    window.addEventListener('resize', handleResize)

    let currentRotationX = 0
    let currentRotationY = 0
    let frameId = 0
    const clock = new THREE.Clock()
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isTouch = window.matchMedia('(pointer: coarse)').matches

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()
      currentRotationX += ((isTouch ? 0 : parallaxTarget.current.y * 0.08) - currentRotationX) * 0.045
      currentRotationY += ((isTouch ? 0 : parallaxTarget.current.x * 0.12) - currentRotationY) * 0.045

      const { stage, progress } = targetCamera.current
      const next = Math.min(stage + 1, heroStages.length - 1)
      lerpCameraStage(heroStages[stage], heroStages[next], progress, camera)
      camera.position.x += currentRotationY
      camera.position.y += currentRotationX

      environment.atmosphere.clouds.children.forEach((cloud, i) => {
        if (!reducedMotion) cloud.position.y = 12 + Math.sin(elapsed * 0.3 + i * 0.7) * 0.3
      })
      renderer.render(scene, camera)
    }

    setIsReady(true)
    animate()

    const disposers = [...disposeRef.current]
    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      disposers.forEach(dispose => dispose())
      renderer.dispose()
      rendererRef.current = undefined
      sceneRef.current = undefined
      cameraRef.current = undefined
    }
  }, [])

  return (
    <div ref={containerRef} className="cinematic-hero">
      <canvas ref={canvasRef} className="hero-canvas" />
      
      {isReady && (
        <>
          {/* Stage content */}
          <div className="hero-content">
            <div className="hero-stage-info">
              <span className="stage-label">
                {heroStages[state.currentStage].label}
              </span>
              <h1 className="hero-headline">
                {heroStages[state.currentStage].headline}
              </h1>
              <p className="hero-description">
                {heroStages[state.currentStage].description}
              </p>
            </div>
          </div>

          {/* Views navigation */}
          <nav className="hero-views" aria-label="Camera stages">
            <div className="views-label">Views</div>
            <div className="views-stages">
              {heroStages.map((stage, index) => (
                <button
                  key={stage.id}
                  className={`view-stage ${state.currentStage === index ? 'active' : ''}`}
                  onClick={() => goToStage(index)}
                  aria-label={stage.label}
                  aria-current={state.currentStage === index ? 'true' : undefined}
                >
                  <span className="view-number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="view-label">{stage.label}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Scroll hint */}
          {state.currentStage === 0 && (
            <div className="hero-scroll-hint">
              <span>Scroll to explore</span>
              <svg width="20" height="32" viewBox="0 0 20 32" fill="none">
                <rect x="1" y="1" width="18" height="30" rx="9" stroke="currentColor" strokeWidth="2"/>
                <circle cx="10" cy="10" r="3" fill="currentColor">
                  <animate attributeName="cy" from="10" to="20" dur="1.5s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" from="1" to="0" dur="1.5s" repeatCount="indefinite"/>
                </circle>
              </svg>
            </div>
          )}

          {/* Scene info */}
          <div className="hero-scene-info">
            <div className="scene-location">La Union · Baguio · Their Little Space</div>
            <div className="scene-description">Two places. One world. Made with love.</div>
          </div>
        </>
      )}
    </div>
  )
}
