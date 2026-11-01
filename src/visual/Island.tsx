import { useEffect, useRef } from 'react'
import * as T from 'three'

export default function Island() {
 const host = useRef<HTMLDivElement>(null)
 useEffect(() => {
  const el = host.current!
  let renderer: T.WebGLRenderer
  try { renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' }) } catch { return }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.setClearColor('#c3ddd7', 1)
  el.appendChild(renderer.domElement)
  const scene = new T.Scene(), camera = new T.PerspectiveCamera(37, 1, .1, 100)
  camera.position.set(8, 8, 12); camera.lookAt(0, .7, 0)
  scene.add(new T.HemisphereLight('#fff2d7', '#47695e', 2.5))
  const light = new T.DirectionalLight('#fff3d0', 3); light.position.set(-4, 8, 5); scene.add(light)
  const world = new T.Group(); scene.add(world)
  const mesh = (geo: T.BufferGeometry, color: string, x: number, y: number, z: number) => {
   const m = new T.Mesh(geo, new T.MeshStandardMaterial({ color, roughness: .85, flatShading: true })); m.position.set(x,y,z); world.add(m); return m
  }
  mesh(new T.CylinderGeometry(5,5,.35,64),'#7bb8b7',0,-.6,0)
  mesh(new T.CylinderGeometry(3.8,4.1,.55,12),'#ead7a5',0,-.2,0)
  mesh(new T.CylinderGeometry(3.5,3.7,.2,12),'#adc6a5',0,.1,-.3)
  mesh(new T.ConeGeometry(2.1,3.5,5),'#739b89',-.7,1.7,-1)
  mesh(new T.ConeGeometry(1.7,2.5,5),'#9bb59a',1.5,1.2,-1.2)
  for (const [x,z] of [[-2.5,.5],[2.8,.5],[1.8,1.7],[-2,-1.7],[-.3,1.9]]) {
   mesh(new T.CylinderGeometry(.07,.1,.7,6),'#79664f',x,.5,z)
   for(let j=0;j<3;j++) mesh(new T.ConeGeometry(.55-j*.12,.9,7),'#365f50',x,.9+j*.35,z)
  }
  mesh(new T.SphereGeometry(.48,20,12),'#f3d18a',-3.7,4.3,-1.7)
  for(let j=0;j<5;j++) { const c=mesh(new T.SphereGeometry(.3,12,8),'#f6f5e9',1+j*.35,3.6,-2); c.scale.set(1.4,.7,1) }
  const envelope=mesh(new T.BoxGeometry(.65,.08,.46),'#fff6de',.2,.4,1.5); envelope.rotation.y=-.4
  mesh(new T.SphereGeometry(.09,12,8),'#bc7d72',.2,.48,1.5)
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'), fine=matchMedia('(pointer:fine)')
  let frame=0, target=0, inView=true
  const draw=()=>{renderer.render(scene,camera)}
  const animate=()=>{ cancelAnimationFrame(frame); if(document.hidden||!inView)return; world.rotation.y+=(target-world.rotation.y)*.09; draw(); if(Math.abs(target-world.rotation.y)>.0002&&!reduced.matches)frame=requestAnimationFrame(animate) }
  const move=(e:PointerEvent)=>{if(reduced.matches||!fine.matches)return; const b=el.getBoundingClientRect(); target=((e.clientX-b.left)/b.width-.5)*.45; animate()}
  const leave=()=>{target=0;animate()}
  const resize=new ResizeObserver(()=>{camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();renderer.setSize(el.clientWidth,el.clientHeight);draw()});resize.observe(el)
  const observer=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;if(inView)animate();else cancelAnimationFrame(frame)});observer.observe(el)
  el.addEventListener('pointermove',move);el.addEventListener('pointerleave',leave);document.addEventListener('visibilitychange',animate);reduced.addEventListener('change',leave)
  const lost=(e:Event)=>{e.preventDefault();renderer.domElement.style.display='none'};renderer.domElement.addEventListener('webglcontextlost',lost)
  draw()
  return()=>{cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();el.removeEventListener('pointermove',move);el.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',animate);reduced.removeEventListener('change',leave);scene.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose())}});renderer.dispose();renderer.domElement.remove()}
 },[])
 return <div className="three-scene" ref={host} aria-label="3D miniature of a coast and pine-covered mountains" role="img"><div className="still-scene" aria-hidden="true"><span>☀</span><span>▲ ▲</span><span>≋ ≋ ≋</span></div></div>
}
