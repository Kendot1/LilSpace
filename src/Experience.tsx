import { useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import ScrollJourney from './journey/JourneyExperience'
import './journey/journey-base.css'

const destinations = [['journey', 'The journey'], ['about', 'About this gift']] as const

export default function Experience() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const goTo = (id: string) => {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }
  return <>
    <a className="skip-link" href="#journey">Skip to the journey</a>
    <header className="space-header"><div className="header-inner">
      <button className="brand" onClick={() => goTo('journey')} aria-label="Her Little Space, start the journey">her little space<span className="brand-period">.</span></button>
      <button ref={menuButton} className="menu-button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="navigation" onClick={() => setMenuOpen(open => !open)}>{menuOpen ? <X /> : <Menu />}</button>
      <nav id="navigation" aria-label="Main navigation" className={menuOpen ? 'open' : ''} onKeyDown={event => { if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus() } }}>{destinations.map(([id, label]) => <button key={id} onClick={() => goTo(id)}>{label}</button>)}</nav>
    </div></header>
    <main id="main"><ScrollJourney />
      <section id="about" className="journey-footer" aria-labelledby="journey-note-title">
        <p className="journey-footer__eyebrow">A quiet note</p><h2 id="journey-note-title">Made to travel a little closer.</h2>
        <p>This is a scroll-led journey from Metro Manila, through Baguio where she studies, toward La Union where she is now. The bouquet at the end is here whenever she wants to revisit it.</p>
        <button onClick={() => goTo('journey')}>Take the journey again</button>
      </section>
    </main>
    <footer className="space-footer"><span>her little space.</span><small>No tracking. No accounts. If publicly hosted, included content is visible to anyone with access to this site.</small></footer>
  </>
}
