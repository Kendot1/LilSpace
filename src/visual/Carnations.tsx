import { useEffect, useRef, useState } from 'react'
import * as T from 'three'
import { createBouquet } from './createBouquet'
import './carnations.css'

export default function Carnations(){
 const host=useRef<HTMLDivElement>(null), received=useRef(false), redraw=useRef<()=>void>(()=>{}),[gift,setGift]=useState(false),[giftUnavailable,setGiftUnavailable]=useState(false)
 useEffect(()=>{
  const el=host.current!
  let renderer:T.WebGLRenderer
  try{renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'})}catch{const timeout=setTimeout(()=>setGiftUnavailable(true),0);return()=>clearTimeout(timeout)}
  const contextLost=()=>setGiftUnavailable(true)
  renderer.domElement.addEventListener('webglcontextlost',contextLost)
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.setClearColor('#e8e7db',1);el.appendChild(renderer.domElement)
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(34,1,.1,50)
  camera.position.set(0,.4,8.7);camera.lookAt(0,.1,0)
  scene.add(new T.HemisphereLight('#fff7ed','#6b8574',2.6))
  const sun=new T.DirectionalLight('#fff2df',3);sun.position.set(-3,5,6);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-4;sun.shadow.camera.right=4;sun.shadow.camera.top=4;sun.shadow.camera.bottom=-4;sun.shadow.normalBias=.025;sun.shadow.bias=-.00015;scene.add(sun)
  const rim=new T.DirectionalLight('#ffd2d7',1.6);rim.position.set(3,2,-3);scene.add(rim)
  const {bouquet,flowers,dispose}=createBouquet();scene.add(bouquet)
  const baseRotations=flowers.map(f=>f.rotation.z)
  const floor=new T.Mesh(new T.PlaneGeometry(200,200),new T.MeshStandardMaterial({color:'#e8e7db',roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-2.35;floor.receiveShadow=true;scene.add(floor)
  const times=[0,.35,.72,1]
  const rotations=[[-.32,-.45,-.15],[-.22,-.12,-.07],[.04,.14,.03],[.07,.2,.05]].flatMap(([x,y,z])=>new T.Quaternion().setFromEuler(new T.Euler(x,y,z)).toArray())
  const clip=new T.AnimationClip('carnation-handoff',1,[
   new T.VectorKeyframeTrack('.position',times,[0,-.45,-.5, 0,-.22,.2, 0,.05,1.25, 0,.1,1.7]).setInterpolation(T.InterpolateSmooth),
   new T.QuaternionKeyframeTrack('.quaternion',times,rotations),
   new T.VectorKeyframeTrack('.scale',times,[.82,.82,.82, .86,.86,.86, .94,.94,.94, .95,.95,.95])
  ])
  const mixer=new T.AnimationMixer(bouquet),action=mixer.clipAction(clip)
  action.setLoop(T.LoopOnce,1);action.clampWhenFinished=true;action.play()
  el.dataset.animationClip=clip.name
  const timer=new T.Timer();timer.connect(document)
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');let frame=0,progress=0,visible=true,stopped=false
  const pose=()=>{const b=el.getBoundingClientRect();return T.MathUtils.clamp((innerHeight*.85-b.top)/(innerHeight*.85+b.height*.25),0,1)}
  const draw=()=>{cancelAnimationFrame(frame);if(stopped||document.hidden||!visible)return;timer.update();const target=received.current?1:pose()*.55;const delta=Math.min(timer.getDelta(),.05)||1/60;const previous=progress;progress=reduced.matches?target:T.MathUtils.damp(progress,target,5.5,delta);if(Math.abs(target-progress)<.001)progress=target;action.paused=false;mixer.setTime(progress);const velocity=(progress-previous)/delta;flowers.forEach((flower,i)=>{flower.rotation.z=baseRotations[i]+(reduced.matches?0:Math.sin(progress*7+i)*velocity*.025)});el.dataset.offerProgress=progress.toFixed(3);renderer.render(scene,camera);if(!reduced.matches&&progress!==target)frame=requestAnimationFrame(draw)}
  redraw.current=draw
  const resize=new ResizeObserver(()=>{camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();renderer.setSize(el.clientWidth,el.clientHeight);draw()});resize.observe(el)
  const observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible)draw();else cancelAnimationFrame(frame)});observer.observe(el)
  const lost=(e:Event)=>{e.preventDefault();renderer.domElement.style.display='none'}
  renderer.domElement.addEventListener('webglcontextlost',lost);window.addEventListener('scroll',draw,{passive:true});document.addEventListener('visibilitychange',draw);reduced.addEventListener('change',draw);draw()
  return()=>{timer.dispose();mixer.stopAllAction();mixer.uncacheRoot(bouquet);stopped=true;redraw.current=()=>{};cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();window.removeEventListener('scroll',draw);document.removeEventListener('visibilitychange',draw);reduced.removeEventListener('change',draw);dispose();floor.geometry.dispose();floor.material.dispose();renderer.dispose();renderer.domElement.removeEventListener('webglcontextlost',contextLost);renderer.domElement.remove()}
 },[])
 const toggle=()=>{received.current=!received.current;setGift(received.current);redraw.current()}
  return <div className="flower-gift"><div ref={host} className="carnation-scene" data-gift={gift?'received':'offered'} role="img" aria-label="A wrapped bouquet of five pink carnations with layered ruffled petals, offered toward you"><div className="carnation-fallback" aria-hidden="true"><span>✿</span><span>✿</span><i/><b>╲│╱</b></div></div>{giftUnavailable&&<p role="status" className="flower-fallback-note">A little illustrated bouquet, just for you. (3D isn’t available on this device.)</p>}<button className="button primary flower-receive" aria-pressed={gift} onClick={toggle}>{gift?'Offer the flowers again':'Receive your carnations'}</button><p className="flower-caption" role="status">{gift?'For you. No occasion needed.':'A small bouquet, from me to you.'}</p></div>
 }

