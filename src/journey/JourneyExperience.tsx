import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TravelScenery from './TravelScenery'
import { chapterIndexAt, chapterOpacity, journeyChapters } from './journey-content'
import '../scroll-journey.css'

gsap.registerPlugin(ScrollTrigger)

export default function JourneyExperience() {
  const section = useRef<HTMLElement>(null)
  const host = useRef<HTMLDivElement>(null)
  const progressRef = useRef(0)
  const reducedRef = useRef(false)
  const triggerRef = useRef<ScrollTrigger | null>(null)
  const [progress, setProgress] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [status, setStatus] = useState('loading-city')

  useLayoutEffect(() => {
    const element = section.current
    if (!element) return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotion = () => {
      reducedRef.current = media.matches
      setReducedMotion(media.matches)
      host.current?.dispatchEvent(new Event('journey-progress'))
    }
    updateMotion()
    media.addEventListener('change', updateMotion)
    const context = gsap.context(() => {
      triggerRef.current = ScrollTrigger.create({
        trigger: element,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: trigger => {
          progressRef.current = trigger.progress
          setProgress(trigger.progress)
          host.current?.dispatchEvent(new Event('journey-progress'))
        },
      })
    }, element)
    return () => {
      media.removeEventListener('change', updateMotion)
      context.revert()
      triggerRef.current = null
    }
  }, [])

  useEffect(() => {
    const container = host.current
    if (!container) return
    let stopped = false
    let cleanup: (() => void) | undefined
    void import('./JourneyRenderer').then(({ mountJourneyRenderer }) => {
      if (stopped) return
      cleanup = mountJourneyRenderer(container, {
        getProgress: () => progressRef.current,
        getReducedMotion: () => reducedRef.current,
        onStatus: value => { if (!stopped) setStatus(value) },
      })
    }).catch(() => { if (!stopped) setStatus('webgl-error') })
    return () => { stopped = true; cleanup?.() }
  }, [])

  const navigate = (value: number) => {
    const trigger = triggerRef.current
    if (!trigger) return
    window.scrollTo({ top: trigger.start + (trigger.end - trigger.start) * value, behavior: 'instant' })
  }
  const activeIndex = chapterIndexAt(progress)
  const active = journeyChapters[activeIndex]
  const failed = status.endsWith('error')
  const statusText = failed
    ? 'The 3D view is unavailable. You can still follow the complete journey and read every message.'
    : status === 'loading-bouquet' ? 'Preparing your flowers…' : status === 'loading-city' ? 'Preparing the view…' : ''

  return <section ref={section} id="journey" className="journey" aria-label="A scroll-driven journey" data-reduced={reducedMotion} data-progress={progress.toFixed(5)} data-chapter={active.id}>
    <h1 className="sr-only">Her Little Space — a journey to you</h1>
    <div className="journey-sticky">
      <a className="journey-skip" href="#about">Skip the animation</a>
      <div ref={host} className="journey-canvas" role="img" aria-label={progress < .2 ? 'The original miniature Metro Manila city, where the journey begins' : progress >= .85 ? 'The custom flower bouquet made for you' : 'Traveling north toward the mountains and coast'} data-status={status} />
      <TravelScenery progress={progress} reducedMotion={reducedMotion} />
      <div className="journey-header" aria-hidden="true"><span className="route-caption">Metro Manila — Baguio — La Union</span></div>
      {journeyChapters.map((chapter, index) => {
        const opacity = chapterOpacity(progress, index)
        return <article key={chapter.id} className="journey-copy" aria-hidden={index !== activeIndex} style={{ opacity, transform: reducedMotion ? undefined : `translateY(${(1 - opacity) * 12}px)`, pointerEvents: index === activeIndex ? 'auto' : 'none' }}>
          <span className="journey-location">{chapter.location}</span>
          <h2>{chapter.title}</h2>
          <p>{chapter.body}</p>
        </article>
      })}
      <p className="journey-status" role="status">{statusText}</p>
      <nav className="journey-chapters" aria-label="Journey chapters">
        {journeyChapters.map((chapter, index) => <button key={chapter.id} aria-label={`Travel to ${chapter.label}`} aria-current={index === activeIndex ? 'step' : undefined} onClick={() => navigate(index === 0 ? 0 : (chapter.range[0] + chapter.range[1]) / 2)}><span aria-hidden="true" /><span>{chapter.label}</span></button>)}
      </nav>
      <div className="journey-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} aria-label="Journey progress"><span style={{ transform: `scaleX(${progress})` }} /></div>
      <span className="journey-scroll-hint">{progress < .98 ? 'Scroll to travel · reverse to return' : 'A little closer, at last'}</span>
      {progress >= .85 && <button className="journey-restart" onClick={() => navigate(0)}>Restart the journey</button>}
    </div>
  </section>
}
