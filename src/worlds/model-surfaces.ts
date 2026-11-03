import * as T from 'three'

/** Purpose-built elliptical garment shells with shaped hems and restrained folds. */
export function tailoredGarment(profile:[number,number,number][],folds=0){
 const vertices:number[]=[],uvs:number[]=[],indices:number[]=[]
 const radial=48
 for(let row=0;row<profile.length;row++){
  const [y,width,depth]=profile[row]
  for(let i=0;i<=radial;i++){
   const angle=i/radial*Math.PI*2
   const ripple=1+folds*Math.cos(angle*10+row*.16)*(1-row/(profile.length+2))
   vertices.push(Math.cos(angle)*width*ripple,y,Math.sin(angle)*depth*ripple)
   uvs.push(i/radial,row/(profile.length-1))
   if(row<profile.length-1&&i<radial){const a=row*(radial+1)+i,b=a+radial+1;indices.push(a,b,a+1,b,b+1,a+1)}
  }
 }
 const geometry=new T.BufferGeometry()
 geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3))
 geometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals()
 geometry.name='tailored-profile-garment'
 return geometry
}
export function surfaceGrain(kind:'cloth'|'wood'|'stone'){
 const size=128,data=new Uint8Array(size*size*4)
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const fine=Math.sin(x*2.39+y*3.17)*9
  const value=kind==='cloth'?128+Math.sin(x*Math.PI)*14+Math.cos(y*Math.PI)*14+fine:
   kind==='wood'?128+Math.sin(x*.32+Math.sin(y*.061)*2.8)*37+fine:128+Math.sin(x*.41)*Math.cos(y*.37)*24+fine
  const n=Math.max(0,Math.min(255,Math.round(value)));data.set([n,n,n,255],(y*size+x)*4)
 }
 const texture=new T.DataTexture(data,size,size,T.RGBAFormat);texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(kind==='cloth'?5:2,kind==='wood'?1:5);texture.needsUpdate=true
 return texture
}
