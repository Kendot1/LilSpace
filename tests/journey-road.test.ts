import {it,expect} from 'vitest'
import {journeyRoadPoint} from '../src/worlds/journey-road'
it('keeps rail clearance and full pavement width constant across bends',()=>{
 for(let z=12;z>=-65;z-=.25){
  const left=journeyRoadPoint(z,-1.35),right=journeyRoadPoint(z,1.35),rail=journeyRoadPoint(z,1.65)
  expect(Math.hypot(left.x-right.x,left.z-right.z)).toBeCloseTo(2.7,9)
  expect(Math.hypot(rail.x-right.x,rail.z-right.z)).toBeCloseTo(.3,9)
 }
})
