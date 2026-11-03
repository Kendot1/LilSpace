import { useEffect, useRef, useState } from 'react'
import { Flower2, Heart, RotateCcw, Sparkles } from 'lucide-react'
import { personal } from '../data/personal'
import './surprise.css'

type Chapter = 'waiting' | 'coast' | 'mountains' | 'letter'

/** A short, interruptible journey; ordinary page content never waits for it. */
export default function Surprise() {
  const [chapter, setChapter] = useState<Chapter>('waiting')
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const action = useRef<HTMLButtonElement>(null)
  const revealing = chapter === 'coast' || chapter === 'mountains'

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!revealing) return
    const timer = window.setTimeout(() => setChapter(reduced || chapter === 'mountains' ? 'letter' : 'mountains'), reduced ? 0 : 1100)
    return () => window.clearTimeout(timer)
  }, [chapter, reduced, revealing])

  const start = () => {
    if (chapter === 'letter') setChapter('waiting')
    else setChapter(reduced ? 'letter' : 'coast')
  }

  return <section id="surprise" data-scroll-progress="0" className="surprise-section section-shell section-space">
    <div className="surprise-heading"><span className="kicker">Kept here, for you</span><h2>A little surprise</h2><p>From the sea to the pines, a little note finds its way to you. Come back to it whenever you like.</p></div>
    <div className="surprise-journey" data-chapter={chapter}>
      <div className="letter-landscape" aria-hidden="true">
        <svg viewBox="0 0 640 260" focusable="false">
          <circle className="journey-sun" cx="490" cy="68" r="33" />
          <g className="journey-clouds"><path d="M70 66h104c0-20-25-27-36-13-12-29-51-20-50 0-12-4-18 3-18 13Z"/><path d="M350 43h74c0-15-19-20-28-9-9-22-38-15-37 0-8-3-13 2-9 9Z"/></g>
          <g className="journey-coast"><path d="M0 155Q90 120 190 153T390 149T640 143V260H0Z"/><path d="M0 185Q110 150 230 184T440 182T640 176"/><path d="M0 216Q110 185 245 218T460 215T640 211"/></g>
          <g className="journey-mountains"><path d="M0 232 120 111 202 172 334 54 492 201 569 124 640 208V260H0Z"/><path d="m0 250 153-82 93 52 170-103 224 143Z"/><g className="journey-pines"><path d="m75 146-28 57h17l-27 43h76l-27-43h17Z"/><path d="m540 121-32 64h18l-30 52h88l-30-52h18Z"/><path d="m592 174-20 40h11l-19 32h56l-19-32h11Z"/></g></g>
        </svg>
      </div>
      {chapter === 'letter' ? <div className="letter-reveal"><article className="letter-paper" aria-label="Your letter"><Flower2 size={30} strokeWidth={1.3} aria-hidden="true"/>{!personal.message && <small className="example-label">Your own words belong here</small>}<p>{personal.message || 'Your personal message has not been added yet. Add your letter in the personal content file.'}</p><span>{personal.signature || 'With care'} <Heart size={14} aria-hidden="true"/></span></article></div> : <div className="envelope-wrap"><div className="envelope" aria-hidden="true"><div className="envelope-flap"/><span><Flower2 size={24}/></span></div></div>}
      <p className="journey-status" role="status">{chapter === 'coast' ? 'A little sea breeze from La Union…' : chapter === 'mountains' ? 'Up through the mist and pines of Baguio…' : chapter === 'letter' ? 'A little note, here for you.' : 'A small journey. No sound needed.'}</p>
      <div className="surprise-actions"><button ref={action} className="button primary" onClick={() => { if (!revealing) start() }} aria-disabled={revealing}>{chapter === 'letter' ? <><RotateCcw size={16} aria-hidden="true"/>Replay surprise</> : <>{revealing ? 'Your letter is on its way…' : 'Open your letter'}<Sparkles size={16} aria-hidden="true"/></>}</button>{revealing && <button className="text-button" onClick={() => { setChapter('letter'); action.current?.focus() }}>Skip to letter</button>}</div>
    </div>
  </section>
}
