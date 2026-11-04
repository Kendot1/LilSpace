import {it,expect} from 'vitest'
import {EquirectangularReflectionMapping} from 'three'
import {createSkyRadiance} from '../src/worlds/reflection-environment'
it('creates bounded finite local HDR radiance with directional variation',()=>{
 const texture=createSkyRadiance(),data=texture.image.data as Float32Array
 expect(texture.mapping).toBe(EquirectangularReflectionMapping)
 expect(data.length).toBe(128*64*4)
 expect(Array.from(data).every(value=>Number.isFinite(value)&&value>=0)).toBe(true)
 expect(Math.max(...data)).toBeGreaterThan(1)
 expect(data[0]).not.toBe(data[data.length-4])
 texture.dispose()
})
