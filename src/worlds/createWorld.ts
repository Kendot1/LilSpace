import * as THREE from 'three'
import { journeyRoadX as roadX, journeyRoadY as roadY, journeyRoadPoint } from './journey-road'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

export type World = 'coast' | 'journey' | 'mountain' | 'little-space'
export type WorldAction = 'shell' | 'flower' | 'book' | 'letter' | 'gift' | 'memories' | 'photo' | 'star'

/** All coordinates are world metres, +Z faces the visitor. Lighting/camera belong to the host. */
export function createWorld(kind: World): {
  group: THREE.Group
  targets: Array<{ id: WorldAction; object: THREE.Object3D; label: string }>
  update: (time: number, delta: number, reduced: boolean) => void
  dispose: () => void
  openGift: (progress: number) => void
  inspect: (id: WorldAction | undefined, progress: number) => void
} {
  const group = new THREE.Group()
  group.name = `${kind}-landscape`
  const targets: Array<{ id: WorldAction; object: THREE.Object3D; label: string }> = []
  const geometries = new Set<THREE.BufferGeometry>()
  const materials = new Set<THREE.Material>()
  const animated: Array<(time: number) => void> = []
  let disposed = false
  let seed = 73421
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296 }
  const geo = <T extends THREE.BufferGeometry>(g: T): T => { geometries.add(g); return g }
  const mat = (color: string, roughness = .85, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness })
    materials.add(m)
    return m
  }
  const coast = kind === 'coast'
  const garden = kind === 'little-space'
  const palette = {
    ground: mat(coast ? '#d8bc89' : garden ? '#7d9570' : '#7e9586'),
    wood: mat(coast ? '#96734e' : '#80604b'),
    darkWood: mat('#4f443b'),
    bark: mat('#655344'),
    leaf: mat(coast ? '#536f40' : garden ? '#47654a' : '#315c50'),
    lightLeaf: mat(coast ? '#84954b' : '#72916a'),
    grass: mat(coast ? '#92945b' : '#779465'),
    stone: mat(coast ? '#ad9a7d' : '#a6afa1'),
    paper: mat('#f5e9ce', .94),
    cream: mat('#e9d9b7'),
    gold: mat('#c59f57', .38, .45),
    coral: mat('#bc7967'),
    lavender: mat('#a49abc'),
    yellow: mat('#e3be6e'),
    teal: mat('#527b77'),
    dark: mat('#3a514c'),
  }
  const box = geo(new THREE.BoxGeometry(1, 1, 1))
  const sphere = geo(new THREE.SphereGeometry(1, 12, 8))
  const cylinder = geo(new THREE.CylinderGeometry(1, 1, 1, 10))
  const cone = geo(new THREE.ConeGeometry(1, 1, 10))
  const petal = geo(new THREE.SphereGeometry(1, 10, 6))
  const dummy = new THREE.Object3D()
  type InstanceBatch = { geometry: THREE.BufferGeometry; material: THREE.Material; matrices: THREE.Matrix4[] }
  const instances = new Map<string, InstanceBatch>()
  function instance(name: string, geometry: THREE.BufferGeometry, material: THREE.Material,
    x: number, y: number, z: number, sx: number, sy: number, sz: number, ry = 0, rz = 0) {
    let batch = instances.get(name)
    if (!batch) { batch = { geometry, material, matrices: [] }; instances.set(name, batch) }
    dummy.position.set(x, y, z); dummy.rotation.set(0, ry, rz); dummy.scale.set(sx, sy, sz); dummy.updateMatrix()
    batch.matrices.push(dummy.matrix.clone())
  }
  function mesh(name: string, geometry: THREE.BufferGeometry, material: THREE.Material, parent: THREE.Object3D = group,
    x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) {
    const object = new THREE.Mesh(geometry, material)
    object.name = name; object.position.set(x, y, z); object.scale.set(sx, sy, sz)
    object.castShadow = true; object.receiveShadow = true; parent.add(object)
    return object
  }
  function part(name: string, parent: THREE.Object3D = group, x = 0, y = 0, z = 0) {
    const object = new THREE.Group(); object.name = name; object.position.set(x, y, z); parent.add(object); return object
  }
  function target(id: WorldAction, label: string, x: number, y: number, z: number) {
    const object = part(`${id}-discovery`, group, x, y, z)
    object.userData.action = id
    object.userData.label = label
    object.userData.keep = true
    targets.push({ id, object, label })
    return object
  }
  function tube(name: string, points: number[][], radius: number, material: THREE.Material, parent: THREE.Object3D = group, segments = 24) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(p[0], p[1], p[2])))
    return mesh(name, geo(new THREE.TubeGeometry(curve, segments, radius, 6, false)), material, parent)
  }
  function terrain(name: string, width: number, depth: number, z: number,
    height: (x: number, z: number) => number, material: THREE.Material, segments = 64) {
    const geometry = geo(new THREE.PlaneGeometry(width, depth, segments, segments))
    geometry.rotateX(-Math.PI / 2); geometry.translate(0, 0, z)
    const positions = geometry.attributes.position
    const colors = new Float32Array(positions.count * 3)
    const tint = new THREE.Color()
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i), zz = positions.getZ(i)
      positions.setY(i, height(x, zz))
      const shade = .91 + Math.sin(x * 1.72 + zz * .93) * .025 + random() * .09
      tint.setRGB(shade, shade, shade)
      colors[i * 3] = tint.r; colors[i * 3 + 1] = tint.g; colors[i * 3 + 2] = tint.b
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.computeVertexNormals()
    const materialCopy = material.clone() as THREE.MeshStandardMaterial
    materialCopy.vertexColors = true; materials.add(materialCopy)
    return mesh(name, geometry, materialCopy)
  }
  const shoreline = (x: number) => -2.8 + Math.sin(x * .21) * .9 + Math.sin(x * .48) * .2
  const groundHeight = (x: number, z: number) => coast
    ? -.24 + (z - shoreline(x)) * .055 + Math.sin(x * .4) * Math.sin(z * .45) * .025
    : -.08 + .12 * Math.sin(x * .35) * Math.cos(z * .27)

  function flower(parent: THREE.Object3D, x: number, y: number, z: number, scale: number, material = palette.cream) {
    const f = part('botanical-flower', parent, x, y, z)
    mesh('stem', cylinder, palette.leaf, f, 0, scale * .42, 0, .022 * scale, .85 * scale, .022 * scale)
    const leaf = mesh('leaf', petal, palette.lightLeaf, f, .13 * scale, .34 * scale, 0, .2 * scale, .045 * scale, .09 * scale)
    leaf.rotation.z = .5
    for (let j = 0; j < 7; j++) {
      const a = j * Math.PI * 2 / 7
      const p = mesh('petal', petal, material, f, Math.cos(a) * .16 * scale, .87 * scale, Math.sin(a) * .16 * scale,
        .19 * scale, .055 * scale, .095 * scale)
      p.rotation.y = -a; p.rotation.z = -.12
    }
    mesh('pollen', sphere, palette.yellow, f, 0, .9 * scale, 0, .085 * scale, .055 * scale, .085 * scale)
    return f
  }
  function wildflowers(count: number) {
    for (let i = 0; i < count; i++) {
      const x = (random() - .5) * 26, z = random() * 16 - 6
      if (Math.abs(x) < 4.7 && z > -5 && z < 6) continue
      if (coast && z < shoreline(x) + 3) continue
      const y = groundHeight(x, z), h = .2 + random() * .45
      instance('meadow-stems', cylinder, palette.grass, x, y + h / 2, z, .012, h, .012)
      for (let j = 0; j < 5; j++) {
        const a = j * Math.PI * 2 / 5
        instance('meadow-petals', petal, garden ? palette.lavender : palette.cream,
          x + Math.cos(a) * .07, y + h, z + Math.sin(a) * .07, .09, .035, .055, -a)
      }
      instance('meadow-centres', sphere, palette.yellow, x, y + h + .015, z, .04, .035, .04)
    }
  }
  function grasses(count: number) {
    const shape = new THREE.Shape()
    shape.moveTo(-.045, 0); shape.quadraticCurveTo(-.08, .33, .12, .7); shape.quadraticCurveTo(.035, .2, .045, 0)
    const blade = geo(new THREE.ShapeGeometry(shape, 5))
    const grassMaterial = palette.grass.clone(); grassMaterial.side = THREE.DoubleSide; materials.add(grassMaterial)
    for (let i = 0; i < count; i++) {
      const x = (random() - .5) * 40, z = random() * 30 - 14
      if (Math.abs(x) < 5 && z > -7 && z < 7) continue
      if (coast && z < shoreline(x) + 2) continue
      const s = .4 + random() * .9
      instance('dune-grass', blade, grassMaterial, x, groundHeight(x, z), z, s, s, s, random() * Math.PI * 2)
    }
  }
  function pines(count: number, radius = 31) {
    for (let i = 0; i < count; i++) {
      const x = (random() - .5) * radius * 2, z = -random() * 34 + 4
      if (Math.abs(x) < 6.5 && z > -13) continue
      if (kind === 'journey' && (Math.abs(x - roadX(z)) < 3.3 || x < -12 || (z > -8 && random() < .75))) continue
      const h = 2.5 + random() * 4.8, base = kind === 'journey' ? journeyHeight(x, z) : groundHeight(x, z)
      instance('pine-trunks', cylinder, palette.bark, x, base + h * .4, z, .11, h * .8, .11)
      for (let j = 0; j < 5; j++) {
        const s = 1 - j * .14
        instance(j % 2 ? 'pine-lit-boughs' : 'pine-boughs', cone, j % 2 ? palette.lightLeaf : palette.leaf,
          x, base + h * (.4 + j * .12), z, h * .29 * s, h * .47 * s, h * .29 * s, random() * 2)
      }
    }
  }
  function distantMountains() {
    const colors = kind === 'journey' ? ['#a5b8b4', '#829f99', '#62867c'] : ['#b2c3c1', '#8eaaa4', '#6e9088']
    for (let layer = 0; layer < 3; layer++) {
      const material = mat(colors[layer])
      const positions: number[] = [], indices: number[] = []
      for (let i = 0; i <= 80; i++) {
        const x = -70 + i * 1.75
        const h = 5 + (2 - layer) * 2 + Math.sin(x * .075 + layer * 1.8) * 3.5 + Math.cos(x * .17 + layer) * 1.8 + Math.sin(x * .38) * .45
        const z = -65 + layer * 12
        positions.push(x, -5, z + 5, x, h, z, x, -5, z - 10)
        if (i < 80) { const a = i * 3; indices.push(a, a + 3, a + 1, a + 1, a + 3, a + 4, a + 1, a + 4, a + 2, a + 2, a + 4, a + 5) }
      }
      const geometry = geo(new THREE.BufferGeometry())
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geometry.setIndex(indices); geometry.computeVertexNormals()
      mesh(`mountain-ridgeline-${layer}`, geometry, material)
    }
  }
  function clouds() {
    const m = new THREE.MeshBasicMaterial({ color: coast ? '#fff0d6' : '#e7eeee', transparent: true, opacity: .3, depthWrite: false })
    materials.add(m)
    // Each bank is locally merged below: soft overlapping lobes, not dozens of transparent draws.
    for (let i = 0; i < 5; i++) {
      const bank = part(`drifting-cloud-bank-${i}`, group, -24 + i * 12, 10 + random() * 4, -28 - random() * 15)
      bank.userData.keep = true
      for (let j = 0; j < 5; j++) mesh('cloud-lobe', sphere, m, bank, j * 1.8, Math.sin(j * 1.2) * .45, 0, 3, .6 + random() * .45, 1.3)
      const x = bank.position.x
      animated.push(t => { bank.position.x = x + Math.sin(t * .035 + i) * 2.2 })
    }
    if (!coast) {
      const haze = new THREE.MeshBasicMaterial({ color: '#dbe6dd', transparent: true, opacity: .12, depthWrite: false })
      materials.add(haze)
      for (let i = 0; i < 3; i++) {
        const bank = mesh(`valley-mist-${i}`, sphere, haze, group, -12 + i * 12, 1.3 + i * .35, -16 - i * 8, 16, .6, 3.5)
        bank.userData.keep = true
        animated.push(t => { bank.position.x = -12 + i * 12 + Math.sin(t * .045 + i) * 2.5 })
      }
    }
  }
  function envelope(parent: THREE.Object3D) {
    mesh('envelope-paper', box, palette.paper, parent, 0, .045, 0, 1.05, .075, .72)
    const flap = new THREE.Shape(); flap.moveTo(-.5, -.32); flap.lineTo(.5, -.32); flap.lineTo(0, .13); flap.closePath()
    const fold = mesh('triangular-envelope-flap', geo(new THREE.ShapeGeometry(flap)), palette.cream, parent, 0, .088, 0)
    fold.rotation.x = -Math.PI / 2
    mesh('wax-seal', cylinder, palette.coral, parent, 0, .108, .04, .095, .035, .095)
    mesh('seal-impression', sphere, palette.gold, parent, 0, .13, .04, .025, .008, .025)
  }
  const bookHinges: Array<{ hinge: THREE.Group; parent: THREE.Object3D; resting: number }> = []
  function book(parent: THREE.Object3D, material = palette.teal, open = false) {
    mesh('book-bottom-cover', box, material, parent, 0, .035, 0, 1.18, .07, .86)
    mesh('book-page-block', box, palette.paper, parent, .015, .125, 0, 1.1, .13, .79)
    for (let i = 0; i < 4; i++) mesh('page-edges', box, palette.cream, parent, .025, .08 + i * .03, .4, 1.07, .006, .008)
    const hinge = part('book-cover-hinge', parent, -.56, .22, 0); hinge.userData.keep = true
    mesh('book-top-cover', box, material, hinge, .56, 0, 0, 1.18, .07, .86)
    hinge.rotation.z = open ? 2.65 : 0
    bookHinges.push({ hinge, parent, resting: hinge.rotation.z })
    mesh('book-spine', box, material, parent, -.56, .13, 0, .1, .2, .86)
    mesh('book-gold-inlay', box, palette.gold, hinge, .56, .042, 0, .68, .012, .025)
    mesh('ribbon-bookmark', box, palette.coral, parent, .32, .205, .31, .065, .012, .52)
    if (open) {
      for (let j = 0; j < 6; j++) mesh('blank-page-ruling', box, palette.cream, parent, .03, .194, -.24 + j * .085, .73, .006, .009)
    }
  }
  function frame(parent: THREE.Object3D) {
    const f = part('standing-keepsake-frame', parent)
    f.rotation.x = -.13
    mesh('frame-back', box, palette.darkWood, f, 0, .65, 0, 1.05, 1.28, .09)
    mesh('blank-photo-mat', box, palette.paper, f, 0, .65, .055, .9, 1.12, .025)
    mesh('empty-photo-insert', box, palette.teal, f, 0, .69, .075, .69, .78, .012)
    for (const x of [-.51, .51]) mesh('frame-carved-upright', box, palette.gold, f, x, .65, .08, .065, 1.31, .09)
    for (const y of [.02, 1.28]) mesh('frame-carved-rail', box, palette.gold, f, 0, y, .08, 1.08, .065, .09)
    const stand = mesh('frame-easel', box, palette.darkWood, f, 0, .38, -.28, .14, .8, .075); stand.rotation.x = -.5
  }
  function steppingStones() {
    for (let i = 0; i < 16; i++) {
      const z = 8 - i * .8, x = Math.sin(i * .55) * .65
      instance('garden-stepping-stones', cylinder, palette.stone, x, groundHeight(x, z) + .045, z, .49 + random() * .15, .09, .32, random())
    }
  }
  function bench(x: number, z: number) {
    const b = part('slatted-garden-bench', group, x, groundHeight(x, z), z)
    for (let i = 0; i < 5; i++) mesh('bench-seat-slat', box, palette.wood, b, 0, .66, -.32 + i * .16, 2.5, .1, .13)
    for (const xx of [-1, 1]) {
      for (const zz of [-.27, .27]) mesh('bench-leg', box, palette.darkWood, b, xx, .32, zz, .1, .65, .1)
      mesh('bench-back-support', box, palette.darkWood, b, xx, 1, -.36, .09, .86, .09)
    }
    for (let i = 0; i < 3; i++) mesh('bench-back-slat', box, palette.wood, b, 0, .94 + i * .18, -.36, 2.5, .12, .09)
    return b
  }

  // A genuine horizon-filling ground surface; there is deliberately no floating display plinth.
  if (kind !== 'journey') terrain('continuous-landscape', 100, 110, -25, groundHeight, palette.ground)
  clouds()
  if (!coast) distantMountains()

  let giftHinge: THREE.Group | undefined
  let giftFlowers: THREE.Group | undefined
  let giftLetter: THREE.Group | undefined
  let giftLight: THREE.MeshStandardMaterial | undefined
  let waterTime: THREE.IUniform<number> | undefined
  const foamTimes: THREE.IUniform<number>[] = []

  if (coast) {
    // CPU-sampled shoreline and GPU-displaced waves share the same analytic profile.
    // The fragment lighting is deliberately self-contained: no reflection render target or asset fetch.
    waterTime = { value: 0 }
    const waveGLSL = `
      float shore(float x) { return -2.8 + sin(x*.21)*.9 + sin(x*.48)*.2; }
      float wave(vec2 p, float t) {
        float depth = clamp((shore(p.x)-p.y)*.22, 0., 1.);
        return -.21 + depth*(sin(p.x*.48+p.y*1.15+t*.85)*.095 + sin(p.x*.91-p.y*.66+t*.62)*.045);
      }
    `
    const waterMaterial = new THREE.ShaderMaterial({
      uniforms: { uTime: waterTime },
      vertexShader: `${waveGLSL}
        uniform float uTime;
        varying vec3 vPosition;
        varying vec3 vNormal;
        void main() {
          vec3 p=position; p.y=wave(p.xz,uTime);
          float e=.06;
          vNormal=normalize(vec3(wave(p.xz-vec2(e,0.),uTime)-wave(p.xz+vec2(e,0.),uTime),2.*e,
            wave(p.xz-vec2(0.,e),uTime)-wave(p.xz+vec2(0.,e),uTime)));
          vPosition=p;
          gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
        }`,
      fragmentShader: `${waveGLSL}
        uniform float uTime;
        varying vec3 vPosition;
        varying vec3 vNormal;
        void main() {
          float depth=clamp((shore(vPosition.x)-vPosition.z)/17.,0.,1.);
          vec3 color=mix(vec3(.32,.66,.61),vec3(.10,.37,.43),depth);
          vec3 n=normalize(vNormal);
          float sun=pow(max(dot(reflect(-normalize(vec3(-.6,1.,-.7)),n),normalize(cameraPosition-vPosition)),0.),110.);
          float ribbon=pow(max(sin(vPosition.z*3.7+vPosition.x*.45+uTime*.6),0.),18.)*.11;
          color+=vec3(1.,.84,.55)*sun*.75+vec3(.34,.49,.43)*ribbon;
          color=mix(color,vec3(.69,.79,.76),smoothstep(24.,85.,-vPosition.z)*.7);
          gl_FragColor=vec4(color,1.);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    })
    materials.add(waterMaterial)
    const waterGeometry = geo(new THREE.PlaneGeometry(120, 95, 120, 96))
    waterGeometry.rotateX(-Math.PI / 2); waterGeometry.translate(0, 0, -48)
    const wp = waterGeometry.attributes.position
    // Bend the front edge exactly onto the curved sand boundary.
    for (let i = 0; i < wp.count; i++) {
      const z = wp.getZ(i), x = wp.getX(i)
      const fraction = (z + 95.5) / 95
      wp.setZ(i, z + (shoreline(x) + .5) * fraction)
    }
    waterGeometry.computeBoundingSphere()
    const water = mesh('animated-tidal-ocean', waterGeometry, waterMaterial)
    water.castShadow = false; water.receiveShadow = false; water.userData.keep = true
    for (let band = 0; band < 3; band++) {
      const positions: number[] = [], uv: number[] = [], indices: number[] = []
      for (let i = 0; i <= 160; i++) {
        const x = -55 + i * 110 / 160
        for (let side = 0; side < 2; side++) {
          positions.push(x, 0, shoreline(x) - band * .85 - side * (.16 + band * .09))
          uv.push(i / 160, side)
        }
        if (i < 160) { const a = i * 2; indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2) }
      }
      const geometry = geo(new THREE.BufferGeometry())
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
      geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geometry.setIndex(indices)
      const clock = { value: 0 }; foamTimes.push(clock)
      const material = new THREE.ShaderMaterial({
        uniforms: { uTime: clock, uBand: { value: band } }, transparent: true, depthWrite: false, side: THREE.DoubleSide,
        vertexShader: `${waveGLSL}
          uniform float uTime; uniform float uBand; varying vec2 vUv; varying float vX;
          void main(){vec3 p=position;p.z+=sin(uTime*.7+uBand*.9)*.12;p.y=wave(p.xz,uTime)+.023;
          vUv=uv;vX=p.x;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
        fragmentShader: `uniform float uTime; uniform float uBand; varying vec2 vUv; varying float vX;
          void main(){float lace=.55+.45*sin(vX*8.+sin(vX*2.7)+uTime*.5);
          float edge=sin(vUv.y*3.14159);float breath=.5+.2*sin(uTime*.7+uBand*.9);
          gl_FragColor=vec4(.91,.96,.85,edge*lace*breath);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          }`,
      }); materials.add(material)
      const foam = mesh(`shoreline-foam-lace-${band}`, geometry, material)
      foam.userData.keep = true; foam.castShadow = false
    }
    // Curved, ringed trunks and individually tapered, arching fronds.
    for (const [px, pz, h, lean] of [[-6, 1, 6.8, 1.3], [7, -1.5, 7.5, -.9], [-10, -2, 5.7, .6], [11, 5, 6.5, -1.2]]) {
      const palm = part('curved-coastal-palm', group, px, groundHeight(px, pz), pz)
      tube('curved-ringed-trunk', [[0, 0, 0], [lean * .15, h * .34, .04], [lean * .6, h * .72, -.06], [lean, h, 0]], .15, palette.bark, palm)
      for (let j = 1; j < 15; j++) {
        const f = j / 15
        const ring = mesh('palm-trunk-growth-ring', geo(new THREE.TorusGeometry(.155 - f * .025, .018, 4, 10)), palette.wood, palm,
          lean * f * f, h * f, 0)
        ring.rotation.x = Math.PI / 2
      }
      mesh('palm-crown', sphere, palette.leaf, palm, lean, h, 0, .3, .36, .3)
      for (let j = 0; j < 9; j++) {
        const angle = j * Math.PI * 2 / 9 + random() * .13
        const points: number[] = [], indices: number[] = []
        for (let k = 0; k <= 18; k++) {
          const f = k / 18, length = 3.1 * f
          const yy = h + Math.sin(f * Math.PI) * .6 - f * f * .95
          const half = Math.sin(f * Math.PI) * .32 * (k % 2 ? .7 : 1)
          for (const side of [-1, 1]) points.push(lean + Math.cos(angle) * length + Math.sin(angle) * half * side,
            yy - Math.abs(half) * .24, Math.sin(angle) * length - Math.cos(angle) * half * side)
          if (k < 18) { const a = k * 2; indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3) }
        }
        const geometry = geo(new THREE.BufferGeometry()); geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3)); geometry.setIndex(indices); geometry.computeVertexNormals()
        const frondMaterial = j % 2 ? palette.leaf : palette.lightLeaf
        frondMaterial.side = THREE.DoubleSide
        mesh('tapered-palm-frond', geometry, frondMaterial, palm)
      }
      for (let j = 0; j < 3; j++) mesh('coconut', sphere, palette.wood, palm, lean + (j - 1) * .2, h - .2, .12, .17, .23, .17)
    }
    // Sand accents stay near the dry shore rather than appearing underwater.
    for (let i = 0; i < 95; i++) {
      const x = (random() - .5) * 32, z = random() * 13
      instance('scattered-shore-pebbles', sphere, palette.stone, x, groundHeight(x, z), z,
        .035 + random() * .1, .035, .045 + random() * .12, random() * 6)
    }
    const shell = target('shell', 'Listen to a little reminder', -2.5, groundHeight(-2.5, 2.2) + .02, 2.2)
    shell.rotation.y = -.35
    // Scallop shell: radial flutes in a curved fan, not a sphere standing in for a shell.
    const shellPositions: number[] = [], shellIndices: number[] = []
    for (let r = 0; r <= 16; r++) for (let a = 0; a <= 48; a++) {
      const theta = -.18 + a / 48 * (Math.PI + .36), radius = r / 16
      const flute = 1 + Math.cos(theta * 24) * .035
      shellPositions.push(Math.cos(theta) * radius * .7 * flute,
        Math.sin(radius * Math.PI) * .22 + Math.sin(theta * 24) * .018 * radius,
        Math.sin(theta) * radius * .73)
      if (r < 16 && a < 48) { const i = r * 49 + a; shellIndices.push(i, i + 49, i + 1, i + 1, i + 49, i + 50) }
    }
    const shellGeometry = geo(new THREE.BufferGeometry()); shellGeometry.setAttribute('position', new THREE.Float32BufferAttribute(shellPositions, 3)); shellGeometry.setIndex(shellIndices); shellGeometry.computeVertexNormals()
    const shellMaterial = palette.paper.clone(); shellMaterial.side = THREE.DoubleSide; materials.add(shellMaterial)
    mesh('ribbed-scallop-shell', shellGeometry, shellMaterial, shell)
    for (let j = 0; j < 13; j++) {
      const a = j * Math.PI / 12
      tube('raised-shell-rib', [[0, .01, 0], [Math.cos(a) * .35, .22, Math.sin(a) * .36], [Math.cos(a) * .69, .015, Math.sin(a) * .72]], .012, palette.cream, shell, 12)
    }
    const driftwood = mesh('sun-bleached-driftwood', cylinder, palette.wood, group, 2.5, .32, 2.9, .24, 3, .2)
    driftwood.rotation.z = Math.PI / 2; driftwood.rotation.y = -.17
    const letter = target('letter', 'A letter by the shore', 2.4, .58, 2.9); letter.rotation.y = -.15; envelope(letter)
    const blossom = target('flower', 'A small space for her', -4.3, groundHeight(-4.3, 4), 4)
    flower(blossom, 0, 0, 0, 1.25)
    for (let j = 0; j < 5; j++) flower(group, -4.2 + random() * 1.6, .1, 4.4 + random(), .4 + random() * .35)
    grasses(650); wildflowers(130)
    // Low headlands frame the water without closing the horizon.
    for (const x of [-35, 35]) mesh('distant-coastal-headland', sphere, palette.leaf, group, x, -.2, -28, 14, 4.2, 11)
  }

  function journeyHeight(x: number, z: number) {
    const distance = Math.abs(x - roadX(z))
    const mountain=roadY(z) - .14 + Math.max(0, distance - 2) * .12
      + Math.sin(x * .23) * Math.sin(z * .18) * Math.min(distance * .09, 1.8)
    const coastalSlope=1-THREE.MathUtils.smoothstep(x,-23,-11)
    return THREE.MathUtils.lerp(mountain,-1.2,coastalSlope)
  }
  if (kind === 'journey') {
    terrain('rolling-mountain-foothills', 85, 95, -30, journeyHeight, palette.lightLeaf)
    // Sea stays spatially present below the ascending road, rather than a destination cut.
    const seaGeometry=geo(new THREE.PlaneGeometry(100,150,50,60));seaGeometry.rotateX(-Math.PI/2)
    const seaMaterial=new THREE.MeshStandardMaterial({color:'#548d98',roughness:.3,metalness:.15})
    materials.add(seaMaterial)
    const seaClock={value:0};waterTime=seaClock
    seaMaterial.onBeforeCompile=shader=>{
      shader.uniforms.journeySeaTime=seaClock
      shader.vertexShader='uniform float journeySeaTime;\n'+shader.vertexShader
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
        transformed.y+=sin(position.x*.45+position.z*.65+journeySeaTime*.8)*.07;`)
    }
    const sea=mesh('coastal-water-below-mountain-road',seaGeometry,seaMaterial,group,-65,-.6,-26)
    sea.userData.keep=true;sea.castShadow=false

    const positions: number[] = [], indices: number[] = []
    for (let i = 0; i <= 180; i++) {
      const z = 12 - i * .43, x = roadX(z), y = roadY(z)
      const derivative = .798 * Math.cos((z + 3) * .14)
      for (const side of [-1, 1]) { const edge=journeyRoadPoint(z,side*1.35); positions.push(edge.x,edge.y,edge.z) }
      if (i < 180) { const a = i * 2; indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2) }
      if (i % 4 === 0) {
        instance('road-centre-dashes', box, palette.cream, x, y + .018, z, .055, .025, .68, Math.atan(derivative))
      }
      if (i % 5 === 0 && z < 4) {
        for (const side of [-1, 1]) {
          const edge=journeyRoadPoint(z,side*1.65)
          instance('mountain-road-guideposts', cylinder, palette.cream, edge.x, y + .28, edge.z, .055, .6, .055)
          instance('guidepost-caps', cylinder, palette.gold, edge.x, y + .55, edge.z, .062, .13, .062)
        }
      }
    }
    const geometry = geo(new THREE.BufferGeometry()); geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geometry.setIndex(indices); geometry.computeVertexNormals()
    mesh('winding-elevated-mountain-road', geometry, mat('#858c82'))
    for (const side of [-1, 1]) {
      const points = []
      for (let i = 0; i <= 180; i++) { const edge=journeyRoadPoint(12-i*.43,side*1.65); points.push([edge.x,edge.y+.49,edge.z]) }
      tube('continuous-roadside-rail', points, .045, palette.wood, group, 400)
    }
    pines(110, 33); grasses(550)
    const rest = bench(-4.7, 3.5); rest.rotation.y = .2
    const reminder = target('book', 'A pause on the way to Baguio', -4.7, .86, 3.55); book(reminder, palette.coral)
    const sign = part('mountain-trail-waymarker', group, 3.9, .1, 1.8)
    mesh('waymarker-post', box, palette.wood, sign, 0, .9, 0, .16, 1.8, .16)
    mesh('waymarker-arrow', box, palette.cream, sign, .25, 1.55, 0, 1.1, .35, .12)
    const triangle = new THREE.Shape(); triangle.moveTo(0, -.175); triangle.lineTo(.3, 0); triangle.lineTo(0, .175); triangle.closePath()
    mesh('waymarker-arrowhead', geo(new THREE.ExtrudeGeometry(triangle, { depth: .12, bevelEnabled: false })), palette.cream, sign, .8, 1.55, -.06)
    const bloom = target('flower', 'A little encouragement for the journey', 3.1, groundHeight(3.1, 3.7), 3.7); flower(bloom, 0, 0, 0, 1.1, palette.yellow)
  }

  if (kind === 'mountain') {
    pines(125, 32); grasses(700); wildflowers(240)
    steppingStones()
    const cabin = part('open-front-reading-cabin', group, 0, .12, -2.3)
    // A room cut open toward +Z; the reading desk remains fully visible/selectable.
    for (let i = 0; i < 20; i++) mesh('individual-floorboard', box, i % 3 === 0 ? palette.wood : palette.darkWood,
      cabin, -3 + i * .31, .17, 0, .295, .2, 4.7)
    for (let i = 0; i < 11; i++) {
      mesh('back-wall-horizontal-cladding', box, palette.wood, cabin, 0, .43 + i * .25, -2.2, 6.35, .22, .16)
      for (const x of [-3.08, 3.08]) mesh('side-wall-cladding', box, palette.wood, cabin, x, .43 + i * .25, -.7, .16, .22, 2.9)
    }
    for (const x of [-3, 3]) {
      mesh('front-timber-pillar', box, palette.darkWood, cabin, x, 1.7, 1.9, .19, 3.1, .19)
      mesh('roof-bearer', box, palette.darkWood, cabin, x, 3.28, -.1, .2, .24, 5.1)
    }
    mesh('front-lintel', box, palette.darkWood, cabin, 0, 3.2, 1.9, 6.4, .24, .2)
    // The back roof slopes away, leaving the front cutaway open instead of obscuring the interior.
    const roof = mesh('sloping-standing-seam-roof', box, palette.dark, cabin, 0, 3.67, -.6, 6.9, .18, 4.5)
    roof.rotation.x = -.18
    for (let i = 0; i < 18; i++) {
      const seam = mesh('roof-standing-seam', box, palette.teal, cabin, -3.2 + i * .38, 3.77, -.6, .025, .04, 4.5)
      seam.rotation.x = -.18
    }
    // Window recess, muntins and sill are architectural geometry, not a flat decal.
    mesh('back-window-shadow', box, palette.dark, cabin, 1.65, 1.95, -2.08, 1.65, 1.35, .04)
    mesh('back-window-sky', box, palette.teal, cabin, 1.65, 1.95, -2.04, 1.45, 1.15, .03)
    for (const x of [.85, 1.65, 2.45]) mesh('window-mullion', box, palette.cream, cabin, x, 1.95, -2, .055, 1.4, .06)
    for (const y of [1.27, 1.95, 2.63]) mesh('window-rail', box, palette.cream, cabin, 1.65, y, -2, 1.66, .055, .06)
    mesh('deep-window-sill', box, palette.cream, cabin, 1.65, 1.22, -1.92, 1.9, .09, .32)
    mesh('desk-top', box, palette.wood, cabin, 0, 1.12, .85, 3.8, .15, 1.25)
    for (const x of [-1.55, 1.55]) for (const z of [.43, 1.3]) mesh('desk-tapered-leg', box, palette.darkWood, cabin, x, .65, z, .12, 1, .12)
    mesh('desk-drawer', box, palette.wood, cabin, 1.1, .91, 1.15, .95, .25, .45)
    mesh('brass-drawer-pull', cylinder, palette.gold, cabin, 1.1, .91, 1.39, .055, .035, .055).rotation.x = Math.PI / 2
    // Stacked books, shelf brackets and ceramics make the open interior feel inhabited without invented personal content.
    mesh('floating-book-shelf', box, palette.darkWood, cabin, -1.6, 2.1, -1.84, 2.2, .1, .5)
    for (let i = 0; i < 8; i++) {
      const color = [palette.teal, palette.coral, palette.cream][i % 3]
      mesh('shelf-book-spine', box, color, cabin, -2.45 + i * .23, 2.38, -1.85, .17, .5 + (i % 3) * .08, .32)
      mesh('spine-gilt-band', box, palette.gold, cabin, -2.45 + i * .23, 2.48, -1.68, .16, .015, .014)
    }
    const openBook = target('book', 'Open the encouragement book', -.65, 1.33, -1.25); openBook.rotation.y = .1; book(openBook, palette.teal, true)
    const letter = target('letter', 'Read the desk letter', 1.05, 1.34, -.8); letter.scale.setScalar(.78); letter.rotation.y = -.15; envelope(letter)
    mesh('pencil-cup', cylinder, palette.teal, cabin, -1.5, 1.43, .5, .14, .45, .14)
    for (let i = 0; i < 5; i++) {
      const pencil = mesh('wooden-pencil', cylinder, i % 2 ? palette.yellow : palette.coral, cabin, -1.57 + i * .035, 1.7, .5, .012, .48, .012)
      pencil.rotation.z = (i - 2) * .13
    }
    mesh('ceramic-mug', geo(new THREE.CylinderGeometry(.16, .13, .27, 16, 1, true)), palette.cream, cabin, .25, 1.34, .45)
    mesh('tea-surface', cylinder, palette.wood, cabin, .25, 1.43, .45, .139, .012, .139)
    mesh('mug-handle', geo(new THREE.TorusGeometry(.105, .028, 6, 14)), palette.cream, cabin, .43, 1.35, .45)
    // A secondary, unobtrusive stethoscope laid on the far end of the desk.
    tube('stethoscope-flexible-tubing', [[1.3, 1.215, .32], [1.5, 1.215, .4], [1.7, 1.215, .8], [1.45, 1.215, 1], [1.25, 1.215, .8]], .023, palette.dark, cabin)
    tube('stethoscope-metal-earpiece', [[1.3, 1.22, .32], [1.2, 1.23, .16], [1.05, 1.23, .12]], .014, palette.gold, cabin)
    mesh('stethoscope-chestpiece', cylinder, palette.gold, cabin, 1.25, 1.235, .8, .075, .025, .075)
    const blossom = target('flower', 'A moment for herself', 3.8, .15, .8)
    mesh('terracotta-planter', geo(new THREE.CylinderGeometry(.38, .27, .57, 16)), palette.coral, blossom, 0, .28, 0)
    flower(blossom, 0, .52, 0, 1, palette.lavender)
    const chair = part('reading-chair', cabin, -2.25, .25, 1.65)
    chair.rotation.y = -.45
    mesh('chair-seat', box, palette.teal, chair, 0, .47, 0, .85, .14, .75)
    mesh('chair-back', box, palette.wood, chair, 0, .95, .32, .88, .73, .1)
    for (const x of [-.3, .3]) for (const z of [-.25, .25]) mesh('chair-leg', box, palette.darkWood, chair, x, .22, z, .075, .44, .075)
    bench(-5.1, 2.4)
  }

  if (garden) {
    grasses(850); wildflowers(400); steppingStones()
    // Intimate garden enclosure: a real timber pergola threaded with foliage and lanterns.
    const pergola = part('wisteria-garden-pergola', group, 0, 0, -3.2)
    for (const x of [-4, 4]) for (const z of [-1.6, 1.6]) {
      mesh('pergola-footing', box, palette.stone, pergola, x, .15, z, .5, .3, .5)
      mesh('pergola-column', box, palette.wood, pergola, x, 2, z, .22, 3.8, .22)
      const brace = mesh('pergola-knee-brace', box, palette.wood, pergola, x - Math.sign(x) * .35, 3.36, z, .12, .95, .12)
      brace.rotation.z = -Math.sign(x) * .75
    }
    for (const z of [-1.7, 1.7]) mesh('pergola-crossbeam', box, palette.wood, pergola, 0, 3.93, z, 9, .25, .22)
    for (let i = 0; i < 13; i++) mesh('pergola-overhead-rafter', box, palette.darkWood, pergola, -4.2 + i * .7, 4.14, 0, .12, .2, 4.6)
    for (let i = 0; i < 95; i++) {
      const side = i % 2 ? -1 : 1, x = (random() - .5) * 8.5, z = -3.2 + side * (1.4 + random() * .4)
      instance('pergola-vine-leaves', petal, palette.leaf, x, 4 + random() * .25, z, .35, .09, .22, random() * 6)
      if (i % 2 === 0) {
        for (let j = 0; j < 4; j++) instance('hanging-wisteria-blooms', sphere, palette.lavender, x + .03 * Math.sin(j),
          3.95 - j * .13, z, .11 - j * .016, .13, .1 - j * .015)
      }
    }
    tube('festoon-light-cable', [[-4, 3.65, -1.5], [-2, 3.2, -1.4], [0, 3.06, -1.4], [2, 3.2, -1.4], [4, 3.65, -1.5]], .015, palette.darkWood)
    const lanternMaterial = mat('#ffe0a0', .4)
    lanternMaterial.emissive.set('#ffd599'); lanternMaterial.emissiveIntensity = .8
    for (let i = 0; i < 11; i++) {
      const x = -3.8 + i * .76, y = 3.06 + x * x * .038
      mesh('warm-festoon-bulb', sphere, lanternMaterial, group, x, y - .13, -1.4, .075, .1, .075)
    }
    bench(-4.6, 1.3); const rightBench = bench(4.6, .2); rightBench.rotation.y = -.25
    const table = part('garden-keepsake-table', group, -.7, .05, -1)
    mesh('rounded-tabletop', cylinder, palette.wood, table, 0, .96, 0, 2.05, .15, .9)
    for (const x of [-1.4, 1.4]) for (const z of [-.45, .45]) mesh('table-leg', box, palette.darkWood, table, x, .46, z, .11, .92, .11)
    const memories = target('memories', 'Open the memory book', -1.6, 1.1, -.8); memories.rotation.y = .14; book(memories, palette.teal)
    const photo = target('photo', 'Your photographs live here', .15, 1.08, -1.1); photo.rotation.y = -.12; frame(photo)
    const letter = target('letter', 'Unfold your personal letter', -3.9, .85, 1.4); letter.rotation.y = .25; envelope(letter)
    const blossom = target('flower', 'Her favorites and dreams', -2.9, .1, 3.4)
    flower(blossom, 0, 0, 0, 1.15, palette.coral)
    for (let i = 0; i < 6; i++) flower(group, -3.9 + random() * 1.8, .05, 3 + random() * 1.2, .5 + random() * .5, i % 2 ? palette.cream : palette.coral)
    const star = target('star', 'A gentle reminder', 4.5, .93, .1)
    const starShape = new THREE.Shape()
    for (let i = 0; i < 10; i++) {
      const angle = Math.PI / 2 + i * Math.PI / 5, radius = i % 2 ? .19 : .42
      if (i === 0) starShape.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
      else starShape.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
    }
    starShape.closePath()
    mesh('brass-reminder-star', geo(new THREE.ExtrudeGeometry(starShape, { depth: .08, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: .025, bevelThickness: .025 })), palette.gold, star, 0, .45, 0)
    mesh('star-pedestal', cylinder, palette.darkWood, star, 0, .03, .03, .36, .09, .23)
    mesh('star-support', cylinder, palette.gold, star, 0, .23, .03, .025, .4, .025)
    const gift = target('gift', 'Open a little surprise', 2.35, groundHeight(2.35, 3.25) + .08, 3.25)
    gift.rotation.y = -.19
    mesh('gift-interior-bottom', box, palette.cream, gift, 0, .08, 0, 1.3, .16, 1.15)
    for (const x of [-.62, .62]) mesh('gift-box-side', box, palette.coral, gift, x, .45, 0, .09, .8, 1.15)
    for (const z of [-.53, .53]) mesh('gift-box-front-back', box, palette.coral, gift, 0, .45, z, 1.3, .8, .09)
    mesh('gift-satin-ribbon-front', box, palette.gold, gift, 0, .45, .582, .14, .8, .012)
    mesh('gift-satin-ribbon-side', box, palette.gold, gift, .672, .45, 0, .012, .8, .14)
    giftHinge = part('gift-lid-hinge', gift, 0, .88, -.6); giftHinge.userData.keep = true
    mesh('gift-lid', box, palette.coral, giftHinge, 0, .04, .6, 1.43, .19, 1.3)
    mesh('gift-lid-inner-lining', box, palette.cream, giftHinge, 0, -.065, .6, 1.29, .012, 1.14)
    mesh('lid-ribbon-lengthwise', box, palette.gold, giftHinge, 0, .143, .6, .15, .025, 1.32)
    mesh('lid-ribbon-crosswise', box, palette.gold, giftHinge, 0, .144, .6, 1.45, .025, .15)
    for (const side of [-1, 1]) {
      const bow = mesh('looped-satin-bow', geo(new THREE.TorusGeometry(.18, .047, 6, 18)), palette.gold, giftHinge, side * .18, .23, .6, 1.25, .63, 1)
      bow.rotation.x = -.28; bow.rotation.z = side * .3
    }
    mesh('bow-knot', sphere, palette.gold, giftHinge, 0, .23, .6, .11, .075, .08)
    giftFlowers = part('surprise-emerging-bouquet', gift, 0, .2, 0); giftFlowers.userData.keep = true
    for (let i = 0; i < 9; i++) {
      const angle = i * 2.39996, r = i === 0 ? 0 : .18 + (i % 3) * .09
      flower(giftFlowers, Math.cos(angle) * r, 0, Math.sin(angle) * r, .7 + (i % 3) * .14, [palette.cream, palette.coral, palette.lavender][i % 3])
    }
    giftLetter = part('surprise-rising-letter', gift, 0, .3, -.15); giftLetter.userData.keep = true
    mesh('revealed-letter-paper', box, palette.paper, giftLetter, 0, .4, 0, .65, .8, .025)
    mesh('revealed-letter-seal', cylinder, palette.gold, giftLetter, 0, .4, .025, .07, .02, .07).rotation.x = Math.PI / 2
    giftLight = mat('#fff2c6'); giftLight.emissive.set('#ffd79a'); giftLight.emissiveIntensity = 0
    mesh('gift-inner-glow', box, giftLight, gift, 0, .15, 0, 1.1, .018, .95)
    // Mature garden trees beyond the pergola keep the space enclosed, never a floating island.
    for (const [x, z] of [[-9, -6], [8, -8], [-11, 3], [10, 3], [-5, -13], [4, -15]]) {
      const h = 4.4 + random() * 1.5
      tube('garden-tree-branching-trunk', [[x, 0, z], [x + .2, h * .65, z], [x + .7, h, z]], .17, palette.bark)
      tube('garden-tree-side-branch', [[x + .1, h * .5, z], [x - .7, h * .8, z + .4], [x - 1.1, h, z + .6]], .085, palette.bark)
      for (let j = 0; j < 9; j++) instance('garden-tree-canopy', sphere, j % 3 ? palette.leaf : palette.lightLeaf,
        x + (random() - .5) * 3, h + random() * 1.2, z + (random() - .5) * 2.4, 1.6, 1, 1.4)
    }
    const fireflies = new Float32Array(65 * 3)
    for (let i = 0; i < 65; i++) { fireflies[i * 3] = (random() - .5) * 15; fireflies[i * 3 + 1] = .6 + random() * 3; fireflies[i * 3 + 2] = (random() - .5) * 12 }
    const pointsGeometry = geo(new THREE.BufferGeometry()); pointsGeometry.setAttribute('position', new THREE.BufferAttribute(fireflies, 3))
    const pointsMaterial = new THREE.PointsMaterial({ color: '#ffe6ad', size: .055, transparent: true, opacity: .72, depthWrite: false })
    materials.add(pointsMaterial)
    const points = new THREE.Points(pointsGeometry, pointsMaterial); points.name = 'garden-light-motes'; group.add(points)
    animated.push(t => { points.rotation.y = Math.sin(t * .025) * .045; points.position.y = Math.sin(t * .3) * .06 })
  }

  for (const [name, batch] of instances) {
    const object = new THREE.InstancedMesh(batch.geometry, batch.material, batch.matrices.length)
    object.name = name
    batch.matrices.forEach((matrix, i) => object.setMatrixAt(i, matrix))
    object.instanceMatrix.needsUpdate = true; object.castShadow = name.includes('pine') || name.includes('canopy')
    object.receiveShadow = true; object.computeBoundingSphere(); group.add(object)
  }

  /** Merge static geometry per material, but preserve target/hinge transforms and raycast ownership.
   * Every resulting mesh has one material and no geometry groups (one draw, not one draw per part).
   */
  function batchStatic(root: THREE.Object3D) {
    root.updateWorldMatrix(true, true)
    const inverse = new THREE.Matrix4().copy(root.matrixWorld).invert()
    const buckets = new Map<THREE.Material, THREE.Mesh[]>()
    const preserved: THREE.Object3D[] = []
    function visit(object: THREE.Object3D) {
      if (object !== root && object.userData.keep) { preserved.push(object); return }
      if (object instanceof THREE.Mesh && !(object instanceof THREE.InstancedMesh) && !Array.isArray(object.material)) {
        const list = buckets.get(object.material) ?? []; list.push(object); buckets.set(object.material, list)
      }
      object.children.forEach(visit)
    }
    visit(root)
    for (const [material, meshes] of buckets) {
      if (meshes.length < 2) continue
      const transformed = meshes.map(object => {
        const source = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone()
        // All primitives share only position + normal; strip UV/color when the material doesn't need them.
        for (const key of Object.keys(source.attributes)) {
          if (key !== 'position' && key !== 'normal' && !(key === 'color' && (material as THREE.MeshStandardMaterial).vertexColors)) source.deleteAttribute(key)
        }
        if (!source.attributes.normal) source.computeVertexNormals()
        source.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse, object.matrixWorld))
        return source
      })
      const merged = mergeGeometries(transformed, false)
      transformed.forEach(g => g.dispose())
      if (!merged) continue
      geo(merged); merged.computeBoundingSphere()
      const object = mesh(`${root.name}-batched-${material.uuid.slice(0, 6)}`, merged, material, root)
      object.userData.parts = meshes.map(m => m.name)
      object.castShadow = meshes.some(m => m.castShadow)
      meshes.forEach(m => m.removeFromParent())
    }
    // Don't batch a retained shader surface: its UVs/uniforms and independent draw are intentional.
    for (const object of preserved) if (!(object instanceof THREE.Mesh)) batchStatic(object)
  }
  batchStatic(group)
  group.updateMatrixWorld(true)

  function openGift(progress: number) {
    if (disposed || !giftHinge || !giftFlowers || !giftLetter) return
    const p = Number.isFinite(progress) ? THREE.MathUtils.clamp(progress, 0, 1) : 0
    const ease = p * p * (3 - 2 * p)
    giftHinge.rotation.x = -ease * Math.PI * .79
    const reveal = THREE.MathUtils.smoothstep(p, .2, 1)
    giftFlowers.visible = reveal > .005; giftLetter.visible = reveal > .05
    giftFlowers.scale.setScalar(.15 + reveal * .85)
    giftFlowers.position.y = .16 + reveal * .58
    giftLetter.position.y = .25 + reveal * .95
    giftLetter.rotation.z = -.12 * reveal
    if (giftLight) giftLight.emissiveIntensity = reveal * .9
  }
  openGift(0)
  // Start the sky at the same deterministic pose used by reduced motion.
  animated.forEach(animate => animate(0))

  return {
    group,
    targets,
    update(time: number, _delta: number, reduced: boolean) {
      if (disposed) return
      const t = reduced || !Number.isFinite(time) ? 0 : time
      if (waterTime) waterTime.value = t
      foamTimes.forEach(clock => { clock.value = t })
      animated.forEach(animate => animate(t))
    },
    openGift,
    inspect(id: WorldAction | undefined, progress: number) {
      const selected=targets.find(target=>target.id===id)?.object
      const amount=THREE.MathUtils.smoothstep(Number.isFinite(progress)?progress:0,0,1)
      for(const item of bookHinges){
        let ancestor:THREE.Object3D|null=item.parent
        while(ancestor&&ancestor!==selected)ancestor=ancestor.parent
        item.hinge.rotation.z=THREE.MathUtils.lerp(item.resting,2.65,selected&&ancestor?amount:0)
      }
    },
    dispose() {
      if (disposed) return
      disposed = true
      // InstancedMesh owns GPU instance buffers in addition to its shared geometry/material.
      group.traverse(object => { if (object instanceof THREE.InstancedMesh) object.dispose() })
      geometries.forEach(geometry => geometry.dispose())
      materials.forEach(material => material.dispose())
      geometries.clear(); materials.clear(); instances.clear(); animated.length = 0
      targets.length = 0
      group.removeFromParent(); group.clear()
    },
  }
}
