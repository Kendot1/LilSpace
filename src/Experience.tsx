import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUpRight, Flower2, Menu, Mountain, RotateCcw, Sparkles, X } from 'lucide-react'
import Memories from './components/Memories'
import Modal from './components/Modal'
import { personal } from './data/personal'
import Surprise from './components/Surprise'
import ScrollJourney from './ScrollJourney'
import './experience.css'
import './visual/carnations.css'
import './visual/gift-polish.css'
import './editorial.css'
const Bouquet=lazy(()=>import('./visual/Carnations'))
const sections=[['home','Home'],['journey','Journey'],['about','About her'],['gallery','Gallery'],['reminders','Gentle reminders'],['memories','Our memories'],['surprise','A little surprise']] as const

function Gallery(){
 const [selected,setSelected]=useState<number>()
 return <section id="gallery" data-scroll-progress="0" className="section-shell section-space"><div className="section-heading"><h2>A little gallery</h2><p>For the places, people, and ordinary moments you want to look at a little longer.</p></div>{personal.gallery.length?<div className="gallery-grid">{personal.gallery.map((photo,i)=><button className="gallery-photo" key={photo.src} onClick={()=>setSelected(i)} aria-label={`View ${photo.caption||photo.alt}`}><img src={photo.src} alt={photo.alt} loading="lazy" onError={e=>{e.currentTarget.style.visibility='hidden'}}/><span>{photo.caption||photo.alt}</span><small>Open photo <ArrowUpRight size={14}/></small></button>)}</div>:<div className="gallery-empty"><p>A place for your photographs.</p><small>No photos have been added yet. When they are, you can open each one here.</small></div>}{selected!==undefined&&<Modal title={personal.gallery[selected].caption||'Gallery photo'} onClose={()=>setSelected(undefined)}><img className="lightbox-image" src={personal.gallery[selected].src} alt={personal.gallery[selected].alt}/><p>{personal.gallery[selected].caption}</p></Modal>}</section>
}

 function Reminders(){
 const [index,setIndex]=useState(0), item=personal.reminders[index%personal.reminders.length]
 const nextReminder=()=>{if(personal.reminders.length>1){setIndex(current=>(current+1)%personal.reminders.length);return}setIndex(current=>current+1)}
 return <section id="reminders" data-scroll-progress="0" className="reminders-section"><div className="section-shell reminder-layout"><div className="section-heading"><h2>Some words,<br/>just for today.</h2><p>No notifications. No expectations. Just a small reminder, whenever you want one.</p></div><div className="reminder-stage" aria-live="polite">{item?<><small>{item.category}</small><h3>{item.title}</h3><p>{item.text}</p><div className="reminder-controls"><button className="text-button" onClick={nextReminder}>Another reminder <RotateCcw size={16}/></button><span>{index+1} / {personal.reminders.length}</span></div></>:<><h3>A quiet moment is a good start.</h3><p>Add your own reminders in the content file when you’re ready.</p></>}</div></div></section>
}

export default function Experience(){

 const [menu,setMenu]=useState(false), [active,setActive]=useState('home')
 const toggle=useRef<HTMLButtonElement>(null)
 useEffect(()=>{const update=()=>{let current='home';for(const [id]of sections){const el=document.getElementById(id);if(el&&el.getBoundingClientRect().top<220)current=id}setActive(current)};window.addEventListener('scroll',update,{passive:true});update();return()=>window.removeEventListener('scroll',update)},[])
 const go=(id:string)=>{setMenu(false);setActive(id);history.pushState(null,'',`#${id}`);document.getElementById(id)?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}
 return <><a className="skip-link" href="#main">Skip to content</a><header className="space-header"><div className="header-inner"><button className="brand" onClick={()=>go('home')} aria-label="Her Little Space, home">her little space<span className="brand-period">.</span></button><button ref={toggle} className="menu-button" aria-label={menu?'Close navigation':'Open navigation'} aria-expanded={menu} aria-controls="navigation" onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button><nav id="navigation" aria-label="Main navigation" className={menu?'open':''} onKeyDown={e=>{if(e.key==='Escape'){setMenu(false);toggle.current?.focus()}}}>{sections.map(([id,label])=><button key={id} onClick={()=>go(id)} aria-current={active===id?'location':undefined}>{label}</button>)}</nav></div></header><main id="main"><section id="home" className="home world-welcome section-shell" aria-labelledby="welcome-title"><div className="home-copy"><span className="home-welcome">A little place to simply be.</span><h1 id="welcome-title">Welcome home, {personal.name||'you'}.</h1><p className="home-greeting">{personal.greeting}</p>{personal.occasion&&<p className="occasion">{personal.occasion}</p>}</div><div className="hero-actions"><button className="button primary" onClick={()=>go('journey')}>Explore the journey <ArrowDown size={16}/></button><button className="text-button" onClick={()=>go('surprise')}><Sparkles size={16}/>A little surprise</button></div></section>
 <ScrollJourney/><section id="about" data-scroll-progress="0" className="section-shell section-space about-section"><div className="about-left"><h2>A little about you</h2><p className="about-intro">{personal.about||'There is a whole world to you. This is a place to hold the pieces you choose to share.'}</p><div className="journey"><Mountain size={22}/><span className="journey-copy">{personal.journey}</span></div></div><div className="about-right">{personal.portrait&&<img className="portrait" src={personal.portrait} alt={personal.portraitAlt||'Personal photo'} loading="lazy"/>}{([['Things she loves',[...personal.favoriteThings,...personal.favoriteColors,...personal.favoriteFlowers]],['Little interests',personal.interests],['Dreaming about',personal.dreams]] as [string,string[]][]).map(([title,items])=><div className="about-row" key={title}><div><h3>{title}</h3>{items.length?<p>{items.join(' · ')}</p>:<p className="empty-detail">A space for her own words. Nothing added yet.</p>}</div></div>)}</div></section>
 <Gallery/><Reminders/><section className="section-shell section-space bouquet-section" aria-labelledby="bouquet-title"><div className="section-heading"><h2 id="bouquet-title">A little bouquet, for you.</h2><p>A tiny bunch of carnations, gently offered. Tap to receive them.</p></div><Suspense fallback={<div className="carnation-fallback" aria-hidden="true">✿ ✿ ✿</div>}><Bouquet/></Suspense></section><Memories/>
 <Surprise/></main><footer className="space-footer"><div className="footer-brand"><Flower2 size={21}/><span>her little space.</span></div><p>Between the mountains and the sea.<br/>A place you can always come back to.</p><small>No tracking. No accounts. Just this little space.<br/>If publicly hosted, included content is visible to anyone with access to the site.</small></footer></>
}
