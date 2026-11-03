import { Color, MathUtils } from 'three'
import type { World } from './createWorld'

const palettes:Record<World,{sky:string;sun:string;intensity:number;fog:number}>={
 coast:{sky:'#c9e2e1',sun:'#fff0ce',intensity:3,fog:.019},
 journey:{sky:'#ccdad5',sun:'#e8eddc',intensity:2.5,fog:.029},
 mountain:{sky:'#c7d8db',sun:'#e7efff',intensity:2.2,fog:.036},
 'little-space':{sky:'#d8dfd0',sun:'#ffe1b0',intensity:2.7,fog:.024},
}
/** Allocation-free sampling, shared by arrival and the reduced-motion endpoint. */
export function sampleWorldAtmosphere(world:World,progress:number,sky:Color,sun:Color){
 const palette=palettes[world]
 const p=MathUtils.smoothstep(Number.isFinite(progress)?progress:0,0,1)
 sky.set(palette.sky);sun.set(palette.sun)
 return {fog:MathUtils.lerp(.16,palette.fog,p),intensity:MathUtils.lerp(palette.intensity*.65,palette.intensity,p)}
}
