import { CatmullRomCurve3, Vector3 } from 'three'

// Composition rails keep the reading column quiet and give each lover a close-up.
const desktop = new CatmullRomCurve3([
 new Vector3(12, 12, -4), new Vector3(12, 10, 0),
 new Vector3(13, 4.8, 15), new Vector3(12, 5, 17),
 new Vector3(11, 4.8, 17), new Vector3(9, 6.5, 24),
 new Vector3(8, 5.5, 22), new Vector3(5, 4.6, 15), new Vector3(3, 3.8, 12),
])
const desktopLook = new CatmullRomCurve3([
 new Vector3(-3, 0, 17), new Vector3(-3, 0, 15),
 new Vector3(2, 2, 2), new Vector3(2, 2.2, 1),
 new Vector3(1.5, 2, 1), new Vector3(-3.5, 1.5, 1),
 new Vector3(-3.5, 1.5, 1), new Vector3(-2.3, 1.7, 2), new Vector3(-2, 1.8, 2),
])
const phone = new CatmullRomCurve3([
 new Vector3(4, 16, -8), new Vector3(4, 13, -3), new Vector3(8, 6, 21),
 new Vector3(7, 8, 29), new Vector3(9, 6, 21), new Vector3(0, 11, 40),
 new Vector3(1, 10, 34), new Vector3(2, 6.7, 24), new Vector3(1, 5.5, 20),
])
const phoneLook = new CatmullRomCurve3([
 new Vector3(0, 0, 17), new Vector3(0, 0, 15), new Vector3(6, 3.7, 2),
 new Vector3(4, 4, 1), new Vector3(6, 3.7, 2), new Vector3(0, 4, 1),
 new Vector3(0, 4, 1), new Vector3(0, 3.7, 2), new Vector3(0, 3.8, 2),
])
export function sampleStoryCamera(progress:number,mobile:boolean,reduced:boolean,position:Vector3,look:Vector3){
 const p=Math.max(0,Math.min(1,Number.isFinite(progress)?progress:0))
 if(reduced){position.set(mobile?0:10,10,mobile?40:25);look.set(mobile?0:-3,mobile?4:2,0);return}
 ;(mobile?phone:desktop).getPoint(p,position)
 ;(mobile?phoneLook:desktopLook).getPoint(p,look)
 // Move along the existing sightline, preserving each chapter's focal point.
 // The closer framing makes the landscape legible without changing the rail.
 position.lerp(look, mobile ? 0.16 : 0.12)
 // Widen only the connection beat, where the figures are still twelve units apart.
 if(mobile && p > .5 && p < .7){
  const weight=Math.sin(Math.PI*(p-.5)/.2)**2
  position.x *= 1-weight
  look.x *= 1-weight
  position.z += 13*weight
 }
}
