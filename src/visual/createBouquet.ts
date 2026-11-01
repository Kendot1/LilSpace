import * as T from 'three'

function petalGeometry(){
 const vertices:number[]=[],colors:number[]=[],indices:number[]=[]
 const rows=12,cols=16
 const root=new T.Color('#a65268'),edge=new T.Color('#ffe1dc')
 for(let r=0;r<=rows;r++)for(let c=0;c<=cols;c++){
  const v=r/rows,u=c/cols,a=(u-.5)*2.2
  const fringe=Math.pow(v,5)*(.028*Math.sin(u*52)+.014*Math.sin(u*97))
  const radius=v*.44+fringe
  const cup=.19*Math.sin(v*Math.PI*.8)+Math.pow(v,4)*(.045*Math.sin(u*37)+.023*Math.cos(u*71))
  vertices.push(Math.sin(a)*radius,Math.cos(a)*radius,cup)
  const color=root.clone().lerp(edge,.28+v*.67);colors.push(color.r,color.g,color.b)
 }
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const a=r*(cols+1)+c,b=a+cols+1;indices.push(a,b,a+1,b,b+1,a+1)}
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry
}

export function createBouquet(){
 const bouquet=new T.Group(),flowers:T.Group[]=[]
 const green=new T.MeshStandardMaterial({color:'#4a6750',roughness:.78}),paper=new T.MeshPhysicalMaterial({color:'#d8b892',roughness:.91,side:T.DoubleSide,sheen:.15,sheenColor:new T.Color('#f6e2c6')})
 const foliage=green.clone();foliage.name='foliage';foliage.side=T.DoubleSide
 const mesh=(geometry:T.BufferGeometry,material:T.Material,parent:T.Object3D=bouquet)=>{const m=new T.Mesh(geometry,material);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
 const positions=[[-.8,1.05,.04],[.02,1.56,-.2],[.82,1.1,.04],[-.4,.65,.65],[.43,.68,.7]]
 const petal=petalGeometry(),dummy=new T.Object3D()
 positions.forEach(([x,y,z],f)=>{
  const head=new T.Group();head.position.set(x,y,z);head.rotation.set(-.12+(f%2)*.12,(f-2)*.13,(2-f)*.12);bouquet.add(head);flowers.push(head)
  const material=new T.MeshPhysicalMaterial({color:['#e69daf','#ffe3cd','#d7819b','#f5bbbd','#c66588'][f],vertexColors:true,side:T.DoubleSide,roughness:.62,sheen:.55,sheenRoughness:.7,sheenColor:new T.Color('#ffe6e1')})
  const count=112,batch=new T.InstancedMesh(petal,material,count);batch.castShadow=true;batch.receiveShadow=true;head.add(batch)
  let index=0
  for(let layer=0;layer<7;layer++){
   const n=22-layer*2
   for(let i=0;i<n;i++){
    const angle=i/n*Math.PI*2+layer*.41,variation=Math.sin(i*12.989+f*7+layer*4)
    dummy.position.set(Math.sin(angle)*(.15-layer*.017),Math.cos(angle)*(.15-layer*.017),layer*.047)
    dummy.rotation.set(.12+layer*.17+variation*.08,variation*.14,angle)
    dummy.scale.set(.98-layer*.095+variation*.04,1.02-layer*.09,1)
    dummy.updateMatrix();batch.setMatrixAt(index++,dummy.matrix)
   }
  }
  batch.instanceMatrix.needsUpdate=true
  const calyx=mesh(new T.ConeGeometry(.16,.38,8),green,head);calyx.position.z=-.16;calyx.rotation.x=-Math.PI/2
  const curve=new T.QuadraticBezierCurve3(new T.Vector3(0,-1.6,0),new T.Vector3(x*.4,-.3,z*.2),new T.Vector3(x,y,z-.12))
  mesh(new T.TubeGeometry(curve,14,.027,6,false),green)
  for(let n=0;n<2;n++){
   const leaf=new T.Shape();leaf.moveTo(0,0);leaf.bezierCurveTo(.22,.18,.16,.56,0,.72);leaf.bezierCurveTo(-.09,.4,-.08,.18,0,0)
   const m=mesh(new T.ShapeGeometry(leaf,10),foliage);m.position.set(x*.4,-.55+n*.5,z*.4);m.rotation.set(.2,n?.2:-.3,(n?1:-1)*.8);m.scale.setScalar(.75)
  }
 })
 // Two overlapping, crimped paper sheets leave the stems visible at the tied waist.
 for(let sheet=0;sheet<2;sheet++){
  const g=new T.PlaneGeometry(1.9,1.8,16,12),p=g.attributes.position
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),t=(y+.9)/1.8;p.setXYZ(i,x*(.27+t*.65),y,Math.abs(x)*.48+Math.sin(x*18)*.025+t*.06)}
  g.computeVertexNormals();const wrap=mesh(g,paper);wrap.position.set(sheet?.08:-.08,-.75,sheet?-.24:.32);wrap.rotation.y=sheet?Math.PI+.25:-.25;wrap.rotation.z=sheet?.12:-.1
 }
 const satin=new T.MeshPhysicalMaterial({color:'#985568',roughness:.35,sheen:1,sheenColor:new T.Color('#e6aab8'),side:T.DoubleSide})
 for(const sign of [-1,1]){
  const points=[new T.Vector3(0,-1.27,.52),new T.Vector3(sign*.37,-1.05,.55),new T.Vector3(sign*.48,-1.34,.52),new T.Vector3(0,-1.29,.56)]
  const loop=new T.CatmullRomCurve3(points);const bow=mesh(new T.TubeGeometry(loop,28,.055,5,false),satin);bow.scale.y=.85
  const tail=mesh(new T.PlaneGeometry(.13,.55,1,7),satin);tail.position.set(sign*.13,-1.62,.5);tail.rotation.z=sign*.2
 }
 const knot=mesh(new T.SphereGeometry(.095,12,10),satin);knot.position.set(0,-1.28,.56)
 const dispose=()=>{const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>();bouquet.traverse(o=>{if(o instanceof T.Mesh){geometries.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m))}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose())}
 return {bouquet,flowers,dispose}
}
