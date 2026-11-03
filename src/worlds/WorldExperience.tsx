import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw, X } from 'lucide-react'
import { personal } from '../data/personal'
import type { World, WorldAction } from './createWorld'
import type { mountWorld } from './world-engine'
import '../world-explorer.css'
import ScrollNarrative from './ScrollNarrative'

type Engine = ReturnType<typeof mountWorld>
const destinations: {id: World; label: string; description: string; objects: [WorldAction, string][]}[] = [
 {id:'coast',label:'La Union',description:'Her present place. A sunlit shore, sea air, and little things to discover.',objects:[['shell','Inspect the seashell'],['letter','Read the shore letter'],['flower','Inspect the flowers']]},
 {id:'journey',label:'The journey',description:'An imagined passage from the coast toward pine-covered mountains, not a map of a real route.',objects:[['book','A note for the journey']]},
 {id:'mountain',label:'Baguio',description:'Where she studies nursing. A mountain reading nook for learning, rest, and encouragement.',objects:[['book','Open the reminder book'],['letter','Read the desk letter'],['flower','Inspect the flowers']]},
 {id:'little-space',label:'Their little space',description:'A separate imagined garden for shared memories and a gift waiting to be opened.',objects:[['memories','Open the memory book'],['photo','View the photo frame'],['letter','Read your letter'],['gift','Open the gift'],['star','Find a gentle reminder']]},
]
export default function WorldExperience(){
 const host=useRef<HTMLDivElement>(null),engine=useRef<Engine|undefined>(undefined)
 const [story,setStory]=useState(true),[journeyProgress,setJourneyProgress]=useState(0)
 const [world,setWorld]=useState<World>('coast'),[selected,setSelected]=useState<WorldAction>(),[ready,setReady]=useState(false),[failed,setFailed]=useState(false),[revealed,setRevealed]=useState(false),[index,setIndex]=useState(0)
 const destination=destinations.find(x=>x.id===world)!,note=personal.reminders[index%Math.max(personal.reminders.length,1)]
 useEffect(()=>{let cancelled=false;import('./world-engine').then(({mountWorld})=>{if(cancelled||!host.current)return;try{engine.current=mountWorld(host.current,id=>{setSelected(id);setRevealed(false)},()=>setRevealed(true),()=>setFailed(true));setReady(true)}catch{setFailed(true)}}).catch(()=>{if(!cancelled)setFailed(true)});return()=>{cancelled=true;engine.current?.dispose();engine.current=undefined}},[])
 const change=(next:World)=>{setStory(false);engine.current?.endStory();engine.current?.change(next);if(next==='journey')engine.current?.travel(0);setWorld(next);setJourneyProgress(0);setSelected(undefined);setRevealed(false)}
 const select=(id:WorldAction)=>{setStory(false);engine.current?.endStory();if(failed||!engine.current){setSelected(id);setRevealed(id==='gift')}else engine.current.focus(id)}
 const jump=(id:string)=>{history.pushState(null,'',`#${id}`);document.getElementById(id)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}
 const letter=personal.message||'Your personal letter has not been added yet. Add your own words in the personal content file; no message has been written on your behalf.'
 const titles:Record<WorldAction,string>={shell:'A small thing, worth noticing',flower:'A closer look at the flowers',book:'A page for a gentler pace',letter:'Your letter',gift:revealed?'A little surprise, opened for you':'Something is opening…',memories:'Your memory book',photo:'A window into a memory',star:'A gentle reminder'}
 return <section id="worlds" className={story?"world-explorer story-active":"section-shell world-explorer"} aria-labelledby="world-title">
 <div className="world-heading"><div><h2 id="world-title">A little closer to you.</h2><p>Two cities, two lovers, and a thread of light that finds its way between them.</p></div><p className="world-geography">{personal.currentLocation}: home now<br/>{personal.studyLocation}: study journey</p></div>
 <div className="world-mode"><button aria-pressed={story} onClick={()=>{setStory(true);setSelected(undefined)}}>Follow the story</button><button aria-pressed={!story} onClick={()=>{setStory(false);engine.current?.endStory()}}>Explore at your own pace</button><a href="#about">Skip the journey</a></div>
 <div className="world-tabs" role="group" aria-label="Choose a world">{destinations.map(x=><button key={x.id} aria-pressed={world===x.id} onClick={()=>change(x.id)}>{x.label}</button>)}</div>
 <ScrollNarrative engine={engine} ready={ready} active={story} onWorld={setWorld} onExplore={()=>{setStory(false);engine.current?.endStory()}}><div className="world-stage"><div ref={host} className="world-canvas" role="img" aria-label={`${destination.label} interactive 3D environment. Equivalent object controls follow below.`}/>{(!ready||failed)&&<div className="world-fallback"><p>{failed?'3D is unavailable on this device. Every keepsake is still available using the controls below.':'Preparing your little world…'}</p></div>}{ready&&!failed&&<div className="camera-controls" role="group" aria-label="Camera controls"><button aria-label="Look left" onClick={()=>engine.current?.rotate(-1)}><ChevronLeft size={18}/></button><button aria-label="Return to the main view" onClick={()=>{engine.current?.reset();setSelected(undefined)}}><RotateCcw size={18}/></button><button aria-label="Look right" onClick={()=>engine.current?.rotate(1)}><ChevronRight size={18}/></button></div>}<span className="world-hint">{!story&&world==='journey'?'Follow the road with the journey slider below':'Tap a keepsake, or choose one below'}</span></div></ScrollNarrative>
 {!story&&world==='journey'&&<div className="world-journey-control"><label htmlFor="journey-progress">Travel toward the mountains</label><input id="journey-progress" type="range" min="0" max="100" value={journeyProgress} aria-valuetext={`${journeyProgress}% of the imagined journey`} onChange={event=>{const value=Number(event.target.value);setJourneyProgress(value);engine.current?.travel(value/100)}}/><p>Move the slider or use the arrow keys. This is an imagined journey, not a real route.</p><button onClick={()=>change('mountain')}>Arrive at the Baguio reading nook</button></div>}
 <p className="world-caption">{destination.description}</p><div className="world-objects" role="group" aria-label={`${destination.label} keepsakes`}>{destination.objects.map(([id,label])=><button key={id} aria-pressed={selected===id} onClick={()=>select(id)}>{label}</button>)}</div>
 {selected&&<article className="world-discovery" aria-labelledby="discovery-title"><header className="discovery-header"><h3 id="discovery-title">{titles[selected]}</h3><button aria-label="Close keepsake" onClick={()=>{setSelected(undefined);engine.current?.reset()}}><X size={20}/></button></header><div role="status">
 {selected==='shell'&&<p>{personal.reminders[0]?.text||'Take a moment to rest.'}</p>}
 {selected==='flower'&&<p>{personal.favoriteFlowers.length?`A place for the flowers she loves: ${personal.favoriteFlowers.join(', ')}.`:'An imagined little planting. Her favorite flowers have not been added yet.'}</p>}
 {(selected==='book'||selected==='star')&&<><p>{note?.text||'Add gentle reminders in the personal content file.'}</p>{personal.reminders.length>1&&<button className="text-button" onClick={()=>setIndex(index+1)}>Turn to another reminder <RotateCcw size={16}/></button>}</>}
 {selected==='letter'&&<p className="world-letter">{letter}</p>}
 {selected==='gift'&&(revealed?<><p className="world-letter">{personal.surpriseMessage||personal.message||'Your surprise message is waiting for your own words. Add it in the personal content file.'}</p><button className="text-button" onClick={()=>select('gift')}>Replay the gift opening <RotateCcw size={16}/></button></>:<><p>The lid lifts, flowers appear, and a letter waits inside.</p><button className="text-button" onClick={()=>setRevealed(true)}>Read the message now</button></>)}
 {selected==='memories'&&<><p>Keep your own moments here. Memories stay on this browser and device until you export a backup.</p><button className="button primary" onClick={()=>jump('memories')}>Browse and add memories</button></>}
 {selected==='photo'&&(personal.gallery.length?<><img className="world-photo" src={personal.gallery[0].src} alt={personal.gallery[0].alt}/><p>{personal.gallery[0].caption}</p><button className="text-button" onClick={()=>jump('gallery')}>Browse all photographs</button></>:<p>No photograph has been added yet. The frame is ready for a supplied photo, not an invented memory.</p>)}
 </div></article>}
 </section>
}
