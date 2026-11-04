import {it,expect} from 'vitest'
import {Color,Vector3} from 'three'
import {sampleJourney} from '../src/worlds/journey-camera'
it('starts at the same desktop and mobile coastal composition before approaching the road',()=>{
 const position=new Vector3(),look=new Vector3(),sky=new Color(),sun=new Color()
 sampleJourney(0,position,look,sky,sun,false)
 expect(position.toArray()).toEqual([8,6.5,12])
 expect(look.toArray()).toEqual([0,2,-7])
 sampleJourney(0,position,look,sky,sun,true)
 expect(position.toArray()).toEqual([10,9,17])
 expect(look.toArray()).toEqual([0,2,-7])
})
it('travels up the same road continuously and reversibly with cooler atmosphere',()=>{
 const position=new Vector3(),look=new Vector3(),sky=new Color(),sun=new Color()
 const start=sampleJourney(0,position,look,sky,sun),initial=position.clone()
 sampleJourney(.22,position,look,sky,sun)
 const foothillHeight=position.y
 const end=sampleJourney(1,position,look,sky,sun)
 expect(position.z).toBeLessThan(initial.z-40)
 expect(position.y).toBeGreaterThan(foothillHeight)
 expect(end.fog).toBeGreaterThan(start.fog)
 sampleJourney(0,position,look,sky,sun);expect(position.equals(initial)).toBe(true)
})
