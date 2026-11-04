import { MathUtils, Vector3, Color } from 'three'
import { journeyRoadX as roadX, journeyRoadY as roadY } from './journey-road'

/** Follows the same analytic road as createWorld; no destination swaps during travel. */
export function sampleJourney(progress:number,position:Vector3,look:Vector3,sky:Color,sun:Color,mobile=false){
 const p=MathUtils.clamp(Number.isFinite(progress)?progress:0,0,1)
 const roadProgress=MathUtils.smoothstep(p,0,.22)
 const z=7-p*48
 position.set(roadX(z),roadY(z)+2.8,z)
 look.set(roadX(z-6),roadY(z-6)+1,z-6)
 // Begin at the exploration camera, then turn gently onto the road.
 position.lerp(new Vector3(mobile ? 10 : 8,mobile ? 9 : 6.5,mobile ? 17 : 12),1-roadProgress)
 look.lerp(new Vector3(0,2,-7),1-roadProgress)
 sky.set('#d8e5dc').lerp(new Color('#bcced6'),p)
 sun.set('#ffe5b3').lerp(new Color('#e2edff'),p)
 return{fog:MathUtils.lerp(.017,.037,p),intensity:MathUtils.lerp(3,2.1,p)}
}
