import * as T from 'three'

/** Low-resolution outdoor radiance, baked once; no scene capture per frame. */
export function createSkyRadiance(){
 const width=128,height=64,data=new Float32Array(width*height*4)
 const horizon=new T.Color('#d4dcd0'),zenith=new T.Color('#718da9'),ground=new T.Color('#414d3c'),sample=new T.Color()
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const elevation=Math.cos((y+.5)/height*Math.PI)
  sample.copy(horizon).lerp(elevation>=0?zenith:ground,Math.pow(Math.abs(elevation),.55))
  const angle=(x+.5)/width*Math.PI*2
  const sunlight=Math.exp(-Math.pow((angle-1.8)/.16,2)-Math.pow((elevation-.45)/.14,2))*3
  sample.r+=sunlight;sample.g+=sunlight*.79;sample.b+=sunlight*.48
  data.set([sample.r,sample.g,sample.b,1],(y*width+x)*4)
 }
 const texture=new T.DataTexture(data,width,height,T.RGBAFormat,T.FloatType)
 texture.mapping=T.EquirectangularReflectionMapping;texture.needsUpdate=true
 return texture
}
export function bakeReflectionEnvironment(renderer:T.WebGLRenderer){
 const source=createSkyRadiance(),generator=new T.PMREMGenerator(renderer)
 try{return generator.fromEquirectangular(source)}finally{source.dispose();generator.dispose()}
}
