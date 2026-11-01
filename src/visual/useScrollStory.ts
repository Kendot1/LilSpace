import { useEffect } from 'react'

/** Progress is local to each section; nothing is hidden without JavaScript. */
export function useScrollStory(){
 useEffect(()=>{
  const sections=Array.from(document.querySelectorAll<HTMLElement>('main > section'))
  const reduced=matchMedia('(prefers-reduced-motion: reduce)')
  let frame=0
  const paint=()=>{frame=0;const measurements=sections.map(el=>{const b=el.getBoundingClientRect();return {el,p:Math.max(0,Math.min(1,(innerHeight-b.top)/(innerHeight+b.height)))}});for(const {el,p} of measurements){el.dataset.scrollProgress=p.toFixed(3);el.style.setProperty('--story-progress',String(reduced.matches?.5:p));el.style.setProperty('--story-drift',`${reduced.matches?0:(p-.5)*36}px`);el.style.setProperty('--story-turn',`${reduced.matches?0:(p-.5)*5}deg`)} }
  const schedule=()=>{if(!frame&&!document.hidden)frame=requestAnimationFrame(paint)}
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);reduced.addEventListener('change',schedule);paint()
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);reduced.removeEventListener('change',schedule);for(const el of sections){delete el.dataset.scrollProgress;el.style.removeProperty('--story-progress');el.style.removeProperty('--story-drift');el.style.removeProperty('--story-turn')}}
 },[])
}
