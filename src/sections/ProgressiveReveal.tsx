import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './ProgressiveReveal.css'

gsap.registerPlugin(ScrollTrigger)

/**
 * Section One: From Here to There
 * Progressive reveal of connected landscape from La Union to Baguio
 */

export function FromHereToThere() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    if (!section || !canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const updateCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
    }
    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)

    // Draw the connected landscape
    const drawLandscape = (progress: number) => {
      const width = canvas.width / Math.min(window.devicePixelRatio, 2)
      const height = canvas.height / Math.min(window.devicePixelRatio, 2)
      
      ctx.clearRect(0, 0, width, height)

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, '#d4e8eb')
      gradient.addColorStop(0.6, '#e8d9c8')
      gradient.addColorStop(1, '#c8d4c0')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // Coastal water (bottom left)
      ctx.fillStyle = '#7ea8b0'
      ctx.globalAlpha = progress
      ctx.beginPath()
      ctx.moveTo(0, height * 0.7)
      ctx.quadraticCurveTo(width * 0.2, height * 0.65, width * 0.4, height * 0.75)
      ctx.lineTo(0, height)
      ctx.closePath()
      ctx.fill()
      ctx.globalAlpha = 1

      // Sand/shore
      ctx.fillStyle = '#d8c4a0'
      ctx.globalAlpha = progress
      ctx.beginPath()
      ctx.moveTo(0, height * 0.7)
      ctx.quadraticCurveTo(width * 0.25, height * 0.68, width * 0.45, height * 0.78)
      ctx.quadraticCurveTo(width * 0.3, height * 0.73, width * 0.15, height * 0.76)
      ctx.lineTo(0, height)
      ctx.closePath()
      ctx.fill()
      ctx.globalAlpha = 1

      // Connecting road
      ctx.strokeStyle = '#8a8674'
      ctx.lineWidth = 8
      ctx.globalAlpha = progress
      ctx.beginPath()
      ctx.moveTo(width * 0.3, height * 0.75)
      ctx.quadraticCurveTo(width * 0.5, height * 0.5, width * 0.7, height * 0.3)
      ctx.quadraticCurveTo(width * 0.8, height * 0.2, width * 0.9, height * 0.15)
      ctx.stroke()
      ctx.globalAlpha = 1

      // Mountain ranges (top right)
      const drawMountain = (x: number, y: number, w: number, h: number, color: string) => {
        ctx.fillStyle = color
        ctx.globalAlpha = progress
        ctx.beginPath()
        ctx.moveTo(x, y + h)
        ctx.lineTo(x + w * 0.3, y + h * 0.4)
        ctx.lineTo(x + w * 0.5, y)
        ctx.lineTo(x + w * 0.7, y + h * 0.3)
        ctx.lineTo(x + w, y + h)
        ctx.closePath()
        ctx.fill()
        ctx.globalAlpha = 1
      }

      drawMountain(width * 0.5, height * 0.1, width * 0.3, height * 0.4, '#6b8a78')
      drawMountain(width * 0.65, height * 0.15, width * 0.25, height * 0.35, '#7a9b88')
      drawMountain(width * 0.75, height * 0.2, width * 0.2, height * 0.3, '#8aac98')

      // Trees along the path
      if (progress > 0.3) {
        const treeCount = Math.floor(12 * progress)
        ctx.fillStyle = '#4a6e52'
        for (let i = 0; i < treeCount; i++) {
          const t = i / 12
          const x = width * (0.3 + t * 0.6) + Math.sin(i * 2) * 20
          const y = height * (0.75 - t * 0.6) + Math.cos(i * 3) * 15
          ctx.globalAlpha = progress * 0.7
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(x - 4, y + 12)
          ctx.lineTo(x + 4, y + 12)
          ctx.closePath()
          ctx.fill()
          ctx.globalAlpha = 1
        }
      }

      // Outline effect (last layer)
      if (progress > 0.7) {
        ctx.strokeStyle = '#3a4a42'
        ctx.lineWidth = 1.5
        ctx.globalAlpha = (progress - 0.7) * 2
        
        // Outline key shapes
        ctx.beginPath()
        ctx.moveTo(width * 0.3, height * 0.75)
        ctx.quadraticCurveTo(width * 0.5, height * 0.5, width * 0.7, height * 0.3)
        ctx.stroke()
        
        ctx.globalAlpha = 1
      }
    }

    // ScrollTrigger for progressive reveal
    const progress = { value: 0 }
    
    ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end: 'bottom center',
      scrub: 1,
      onUpdate: (self) => {
        progress.value = self.progress
        drawLandscape(self.progress)
      }
    })

    // Initial draw
    drawLandscape(0)

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill())
      window.removeEventListener('resize', updateCanvasSize)
    }
  }, [])

  return (
    <section ref={sectionRef} className="progressive-section from-here-to-there">
      <div className="section-visual">
        <canvas ref={canvasRef} className="landscape-canvas" />
      </div>
      
      <div className="section-editorial">
        <div className="editorial-content">
          <h2 className="section-title">From here to there</h2>
          
          <div className="editorial-block">
            <h3>La Union: Where She Is</h3>
            <p>
              The coast holds her now. Sunlit shores, the rhythm of waves, 
              and the warmth of home surround her days.
            </p>
          </div>

          <div className="editorial-block">
            <h3>Baguio: Where She Grows</h3>
            <p>
              In the mountains, she learns. Cool air, quiet study spaces, 
              and the dedication of a nursing student shape her journey.
            </p>
          </div>

          <div className="editorial-block">
            <h3>A Place Between Us</h3>
            <p>
              This little world connects them. Neither coast nor mountain, 
              but a space made to hold what distance cannot touch.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Section Two: Inside Our Little Space
 * Progressive assembly of the personal sanctuary
 */

export function InsideOurLittleSpace() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const svg = svgRef.current
    if (!section || !svg) return

    // Animate SVG elements progressively
    const elements = svg.querySelectorAll('[data-reveal]')
    
    elements.forEach((element, index) => {
      gsap.fromTo(element,
        {
          opacity: 0,
          scale: 0.8,
          strokeDashoffset: element instanceof SVGPathElement ? 
            element.getTotalLength() : 0
        },
        {
          opacity: 1,
          scale: 1,
          strokeDashoffset: 0,
          duration: 1.2,
        ease: 'power2.out',
        delay: index * 0.1,
        scrollTrigger: {
            trigger: section,
            start: 'top 60%',
            end: 'center center',
            scrub: 1,
            once: false
          }
        }
      )
    })

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill())
    }
  }, [])

  return (
    <section ref={sectionRef} className="progressive-section inside-little-space">
      <div className="section-visual-full">
        <svg ref={svgRef} viewBox="0 0 800 600" className="world-assembly-svg">
          {/* Terrain base */}
          <ellipse data-reveal cx="400" cy="550" rx="350" ry="40" 
            fill="#8b9b7a" opacity="0.3" />
          
          {/* Pathways */}
          <path data-reveal
            d="M 400 580 Q 400 520 400 460 Q 395 420 380 380"
            stroke="#9a8e7a" strokeWidth="8" fill="none"
            strokeLinecap="round" />
          
          {/* House structure */}
          <g data-reveal>
            <rect x="320" y="280" width="160" height="140" 
              fill="#e8dcc8" stroke="#5a4738" strokeWidth="2" />
            <polygon points="320,280 400,220 480,280" 
              fill="#4a3f3a" stroke="#3a2f2a" strokeWidth="2" />
            <rect x="360" y="340" width="35" height="60" 
              fill="#735a48" stroke="#5a4738" strokeWidth="1" />
            <rect x="430" y="320" width="30" height="30" 
              fill="#93b5c6" stroke="#6a7f8a" strokeWidth="1" />
          </g>

          {/* Trees */}
          <g data-reveal>
            <polygon points="200,400 180,460 220,460" fill="#4a6e52" />
            <rect x="195" y="460" width="10" height="40" fill="#5a4738" />
          </g>
          <g data-reveal>
            <polygon points="600,380 580,440 620,440" fill="#4a6e52" />
            <rect x="595" y="440" width="10" height="40" fill="#5a4738" />
          </g>

          {/* Garden elements */}
          <circle data-reveal cx="300" cy="480" r="8" fill="#e8c4b8" />
          <circle data-reveal cx="320" cy="490" r="6" fill="#f5e6d3" />
          <circle data-reveal cx="500" cy="485" r="7" fill="#d4a5a5" />

          {/* Memory markers */}
          <g data-reveal>
            <circle cx="450" cy="380" r="12" fill="#b8a4c9" opacity="0.6" />
            <text x="450" y="385" textAnchor="middle" fontSize="14" fill="#fff">M</text>
          </g>

          {/* Letter marker */}
          <g data-reveal>
            <rect x="340" y="470" width="20" height="15" fill="#f5ead6" 
              stroke="#8b7355" strokeWidth="1" />
          </g>

          {/* Gift box */}
          <g data-reveal>
            <rect x="500" cy="500" width="30" height="25" fill="#e8a4a8" 
              stroke="#b8848a" strokeWidth="1.5" />
            <line x1="515" y1="500" x2="515" y2="525" stroke="#d4b46e" strokeWidth="2" />
          </g>
        </svg>
      </div>

      <div className="section-editorial-overlay">
        <div className="editorial-themes">
          <div className="theme-card">
            <h3>A Place to Rest</h3>
            <p>The atmosphere and feeling of the environment.</p>
          </div>
          <div className="theme-card">
            <h3>Little Details</h3>
            <p>The flowers, objects, and things that make the world feel personal.</p>
          </div>
          <div className="theme-card">
            <h3>Memories</h3>
            <p>Photographs, letters, and keepsakes.</p>
          </div>
          <div className="theme-card">
            <h3>Always Here</h3>
            <p>Gentle reminders and personal messages.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
