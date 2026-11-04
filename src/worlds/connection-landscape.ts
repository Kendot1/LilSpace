import * as T from 'three'

/** Continuous land and tidal inlet; no plinth or miniature display edges. */
export function createConnectionLandscape(){
 const group=new T.Group();group.name='continuous-coastal-mountain-landscape'
 const geometries:T.BufferGeometry[]=[],materials:T.Material[]=[],textures:T.Texture[]=[]
 const height=(x:number,z:number)=>{
  const shoreZ=z-Math.sin(x*.12)*2.1-Math.sin(x*.29+.7)*.8
  const foreground=T.MathUtils.smoothstep(shoreZ,4,14)
  const distance=Math.max(0,-z-6)
  const ridges=distance*.12+(Math.sin(x*.11+z*.14)*Math.cos(z*.08)+1)*distance*.045
  const channelCenter=Math.sin((z-2)*.085)*1.1
  const channel=(1-T.MathUtils.smoothstep(Math.abs(x-channelCenter),1.7,4.8))*(1-T.MathUtils.smoothstep(-z,15,29))
  return .02-foreground*1.35+ridges+Math.sin(x*.21)*Math.sin(z*.16)*.06-channel*1.15
 }
 const terrain=new T.PlaneGeometry(180,180,180,180);terrain.rotateX(-Math.PI/2);terrain.translate(0,0,-55)
 const positions=terrain.attributes.position,colors=new Float32Array(positions.count*3),color=new T.Color()
 const sand=new T.Color('#c6aa7f'), inland=new T.Color('#31574e'), mountain=new T.Color('#50675e')
 for(let i=0;i<positions.count;i++){
  const x=positions.getX(i),z=positions.getZ(i),y=height(x,z);positions.setY(i,y)
  // Warm exposed sand blends into cooler inland ground over the same terrain.
  const shore=T.MathUtils.smoothstep(z-Math.sin(x*.12)*2.1-Math.sin(x*.29+.7)*.8,3,13)
  const elevation=T.MathUtils.smoothstep(-z,5,35)
  color.copy(inland).lerp(mountain,elevation*.65).lerp(sand,shore*.9)
  color.multiplyScalar(.88+.12*Math.sin(x*.7+Math.sin(z*.55)))
  colors.set(color.toArray(),i*3)
 }
 terrain.setAttribute('color',new T.BufferAttribute(colors,3));terrain.computeVertexNormals();geometries.push(terrain)
 // Deterministic micro-relief texture, generated locally with no image requests.
 const data=new Uint8Array(128*128*4)
 for(let y=0;y<128;y++)for(let x=0;x<128;x++){const i=(y*128+x)*4;const n=128+Math.round(Math.sin(x*1.73+y*.83)*25+Math.sin(x*.18-y*.37)*18);data.set([n,n,n,255],i)}
 const grain=new T.DataTexture(data,128,128,T.RGBAFormat);grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.repeat.set(35,35);grain.needsUpdate=true;textures.push(grain)
 const landMaterial=new T.MeshStandardMaterial({color:'#c0c8ba',vertexColors:true,roughness:.94,bumpMap:grain,bumpScale:.07});materials.push(landMaterial)
 const land=new T.Mesh(terrain,landMaterial);land.name='sculpted-unbroken-terrain';land.receiveShadow=true;group.add(land)
 const time={value:0}
 const waterGeometry=new T.PlaneGeometry(240,180,100,70);waterGeometry.rotateX(-Math.PI/2);waterGeometry.translate(0,-.68,68);geometries.push(waterGeometry)
 const waterMaterial=new T.MeshStandardMaterial({color:'#244b57',roughness:.24,metalness:.32})
 waterMaterial.onBeforeCompile=shader=>{
  shader.uniforms.landscapeTime=time
  shader.vertexShader='uniform float landscapeTime;\nvarying vec3 landscapePoint;\n'+shader.vertexShader
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   transformed.y += sin(position.x*.38+landscapeTime*.55)*.055+sin(position.z*.72-landscapeTime*.48)*.035;
   landscapePoint=transformed;`)
  shader.fragmentShader='varying vec3 landscapePoint;\nuniform float landscapeTime;\n'+shader.fragmentShader
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float glint=pow(max(0.0,sin(landscapePoint.x*1.6+sin(landscapePoint.z*.8)+landscapeTime*.35)),18.0);
   diffuseColor.rgb+=vec3(.025,.04,.04)*glint;`)
 }
 materials.push(waterMaterial);const water=new T.Mesh(waterGeometry,waterMaterial);water.name='animated-tidal-horizon';water.receiveShadow=true;group.add(water)
 // A continuous curved inlet connects the bridge crossing to the foreground sea.
 const channelVertices:number[]=[],channelIndices:number[]=[]
 for(let row=0;row<=100;row++){
  const z=-21+row*.48,center=Math.sin((z-2)*.085)*1.1
  channelVertices.push(center-3,-.68,z,center+3,-.68,z)
  if(row<100){const a=row*2;channelIndices.push(a,a+2,a+1,a+1,a+2,a+3)}
 }
 const inletGeometry=new T.BufferGeometry();inletGeometry.setAttribute('position',new T.Float32BufferAttribute(channelVertices,3));inletGeometry.setIndex(channelIndices);inletGeometry.computeVertexNormals();geometries.push(inletGeometry)
 const inlet=new T.Mesh(inletGeometry,waterMaterial);inlet.name='bridge-tidal-channel';group.add(inlet)
 // Shoreline contours follow the land/water crossing instead of outlining a platform.
 const foamMaterial=new T.MeshBasicMaterial({color:'#a5c7be',transparent:true,opacity:.33,depthWrite:false});materials.push(foamMaterial)
 for(let band=0;band<3;band++){
  const points:T.Vector3[]=[]
  for(let i=0;i<=100;i++){const x=-65+i*1.3;points.push(new T.Vector3(x,-.60+band*.015,9+band*.65+Math.sin(x*.12)*2.1+Math.sin(x*.29+.7)*.8))}
  const geometry=new T.TubeGeometry(new T.CatmullRomCurve3(points),100,.025+band*.008,4,false);geometries.push(geometry)
  const line=new T.Mesh(geometry,foamMaterial);line.name='tidal-foam-contour';group.add(line)
 }
 return{group,height,update:(elapsed:number,reduced:boolean)=>{time.value=reduced?0:elapsed},dispose:()=>{geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());group.removeFromParent();group.clear()}}
}
