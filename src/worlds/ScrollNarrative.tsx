import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Modal from '../components/Modal'
import { personal } from '../data/personal'
import type { mountWorld } from './world-engine'
import type { World } from './createWorld'
import './scroll-narrative.css'
import './connection-story.css'
import './editorial-story.css'

gsap.registerPlugin(ScrollTrigger)
const order:World[]=['coast','journey','mountain','little-space']
export function narrativeBeat(progress:number){
 const p=Math.max(0,Math.min(1,Number.isFinite(progress)?progress:0))
 const world=Math.min(3,Math.floor(p*4))
 const beat=world===3?(p<.875?6:p<.94?7:8):world*2+(p% .25>=.125?1:0)
 return {world:order[world],beat,progress:p}
}
export default function ScrollNarrative({children,engine,ready,active,onWorld,onExplore}:{children:ReactNode;engine:RefObject<ReturnType<typeof mountWorld>|undefined>;ready:boolean;active:boolean;onWorld:(world:World)=>void;onExplore:()=>void}){
 const track=useRef<HTMLDivElement>(null),chapterRef=useRef<World>('coast'),onWorldRef=useRef(onWorld)
 const [beat,setBeat]=useState(0),[finished,setFinished]=useState(false),[letterOpen,setLetterOpen]=useState(false)
 useEffect(()=>{onWorldRef.current=onWorld},[onWorld])
 useEffect(()=>{
  if(!track.current||!active)return
  const el=track.current, currentEngine=engine.current
  const paint=(value:number)=>{
   const state=narrativeBeat(value)
   engine.current?.story(value)
   el.style.setProperty('--narrative-progress',String(value))
   el.dataset.progress=value.toFixed(4)
   setBeat(old=>old===state.beat?old:state.beat)
   setFinished(value>=.985)
   if(chapterRef.current!==state.world){chapterRef.current=state.world;onWorldRef.current(state.world)}
  }
  const context=gsap.context(()=>{
   ScrollTrigger.create({id:'little-space-story',trigger:el,start:'top top+=78',end:'bottom bottom',onUpdate:self=>paint(self.progress),onRefresh:self=>paint(self.progress)})
  },el)
  ScrollTrigger.refresh()
  paint(ScrollTrigger.getById('little-space-story')?.progress??0)
  return()=>{context.revert();currentEngine?.endStory()}
 },[engine,ready,active])
 const seek=(progress:number)=>{
  const trigger=ScrollTrigger.getById('little-space-story')
  if(trigger)window.scrollTo({top:trigger.start+(trigger.end-trigger.start)*progress,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})
 }
 const passage=personal.story[beat]
 return <div className={active?"narrative-track":"narrative-explore"} ref={track} data-beat={beat}>
  <div className="narrative-sticky">
   {children}
   {active&&<><div className="narrative-copy" key={beat}><p className="narrative-place">{({coast:`${personal.currentLocation} · here now / ${personal.studyLocation} · study journey`,journey:'For the woman I love',mountain:'A thread of light between us','little-space':'An imagined place, together'})[order[Math.min(3,Math.floor(beat/2))]]}</p><h3>{passage?.title}</h3><p>{passage?.text}</p>{finished&&<div className="narrative-letter"><p>I love you. This little world is for you.</p><button className="connection-read-letter" onClick={()=>setLetterOpen(true)}>Read my full letter</button></div>}</div>
   <div className="connection-caption"><span>{personal.senderLocation} · him</span><span>{personal.studyLocation} · where you study</span></div>
   <div className="narrative-toolbar"><span>{finished?'A little world to return to.':'Scroll to follow the story'}</span><button onClick={onExplore}>Explore freely</button></div>
   <nav className="narrative-chapters" aria-label="Story chapters">{['Two cities','You & me','The connection','Together'].map((label,i)=><button key={label} onClick={()=>seek(i*.25+.04)} aria-label={`Go to ${label}`} aria-current={Math.min(3,Math.floor(beat/2))===i?'step':undefined}>{label}</button>)}</nav>
   <div className="narrative-progress" aria-hidden="true"/>{letterOpen&&<Modal title="A letter from me to you" onClose={()=>setLetterOpen(false)}><p className="connection-full-letter">{personal.surpriseMessage||personal.message||personal.connectionLetter}</p></Modal>}</>}
  </div>
 </div>
}
