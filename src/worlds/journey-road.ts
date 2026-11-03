/** Single analytic centreline and normal shared by pavement, rails and camera. */
export const journeyRoadX=(z:number)=>Math.sin((z+3)*.14)*5.7
export const journeyRoadY=(z:number)=>.16+Math.max(0,-z)*.075
export function journeyRoadPoint(z:number,offset=0){
 const derivative=.798*Math.cos((z+3)*.14),length=Math.hypot(1,derivative)
 return{x:journeyRoadX(z)+offset/length,y:journeyRoadY(z),z:z-offset*derivative/length}
}
