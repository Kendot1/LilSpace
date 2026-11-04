import * as THREE from 'three'
import { createConnectionLandscape } from './connection-landscape'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { surfaceGrain, tailoredGarment } from './model-surfaces'

/** A symbolic QC ↔ Baguio stage, not a map, portrait, or claim about either person's home.
 * Host owns camera, sky, and key lighting. All scroll poses are absolute and reversible. */
export function createConnection(): {
  group: THREE.Group
  update: (time: number, delta: number, reduced: boolean) => void
  setProgress: (p: number, reduced: boolean) => void
  dispose: () => void
  male: THREE.Group
  female: THREE.Group
  thread: THREE.Object3D
} {
  const group = new THREE.Group()
  group.name = 'two-cities-one-garden'
  const geometries = new Set<THREE.BufferGeometry>()
  const materials = new Set<THREE.Material>()
  const instanced: THREE.InstancedMesh[] = []
  let disposed = false
  let seed = 29231
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296 }
  const geometry = <T extends THREE.BufferGeometry>(g: T) => { geometries.add(g); return g }
  const material = (color: string, emission?: string) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: .78, metalness: 0,
      emissive: emission ?? '#000000', emissiveIntensity: emission ? .75 : 0 })
    materials.add(m); return m
  }
  const p = {
    earth: material('#152c38'), stone: material('#30454f'), paving: material('#68736d'),
    grass: material('#264b47'), pine: material('#1b514b'), pineTip: material('#39756a'),
    bark: material('#65564b'), wood: material('#715947'), brass: material('#b99a63'),
    wall: material('#51726e'), skyline: material('#284655'), skyline2: material('#3b5661'),
    roof: material('#203b48'), cream: material('#f0e6d1'), skin: material('#cb9476'),
    hair: material('#252631'), coat: material('#7dabb9'), trousers: material('#24374d'),
    dress: material('#efc28e'), shoes: material('#293239'), petals: material('#dfccac'),
    lavender: material('#9397b5'), light: material('#ffe2a4', '#ffc477'),
    luminous: material('#ffe9b0', '#ffd28c'), darkWindow: material('#152e3c'),
  }
  // Separate warm ceramic skin, matte cloth and restrained metal highlights.
  p.skin.roughness = .56
  p.hair.roughness = .62
  p.coat.roughness = .9
  p.dress.roughness = .88
  p.brass.metalness = .45; p.brass.roughness = .42
  p.light.emissiveIntensity = .42
  const textures = [surfaceGrain('cloth'), surfaceGrain('wood'), surfaceGrain('stone')]
  for (const cloth of [p.coat, p.dress, p.trousers]) { cloth.bumpMap = textures[0]; cloth.bumpScale = .012 }
  p.wood.bumpMap = textures[1]; p.wood.bumpScale = .035
  for (const masonry of [p.wall, p.skyline, p.skyline2, p.stone]) { masonry.bumpMap = textures[2]; masonry.bumpScale = .018 }
  const box = geometry(new RoundedBoxGeometry(1, 1, 1, 2, .035))
  const sphere = geometry(new THREE.SphereGeometry(1, 16, 12))
  const cylinder = geometry(new THREE.CylinderGeometry(1, 1, 1, 12))
  const cone = geometry(new THREE.ConeGeometry(1, 1, 16))
  const capsule = geometry(new THREE.CapsuleGeometry(1, 1, 4, 12))
  const dummy = new THREE.Object3D()
  type Batch = { geometry: THREE.BufferGeometry; material: THREE.Material; matrices: THREE.Matrix4[]; names: Set<string> }
  const batches = new Map<THREE.Object3D, Map<string, Batch>>()
  function part(name: string, parent: THREE.Object3D = group) {
    const object = new THREE.Group(); object.name = name; parent.add(object); return object
  }
  // Instances are batched in each independently animated coordinate system.
  function put(name: string, g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number,
    sx = 1, sy = 1, sz = 1, parent: THREE.Object3D = group, rx = 0, ry = 0, rz = 0) {
    let buckets = batches.get(parent)
    if (!buckets) { buckets = new Map(); batches.set(parent, buckets) }
    const key = `${g.uuid}/${m.uuid}`
    let batch = buckets.get(key)
    if (!batch) { batch = { geometry: g, material: m, matrices: [], names: new Set() }; buckets.set(key, batch) }
    dummy.position.set(x, y, z); dummy.scale.set(sx, sy, sz); dummy.rotation.set(rx, ry, rz); dummy.updateMatrix()
    batch.matrices.push(dummy.matrix.clone()); batch.names.add(name)
  }
  function mesh(name: string, g: THREE.BufferGeometry, m: THREE.Material, parent: THREE.Object3D = group) {
    const object = new THREE.Mesh(g, m); object.name = name; parent.add(object); return object
  }
  function tube(name: string, points: THREE.Vector3[], radius: number, m: THREE.Material, parent: THREE.Object3D = group, segments = 64) {
    const curve = new THREE.CatmullRomCurve3(points)
    return mesh(name, geometry(new THREE.TubeGeometry(curve, segments, radius, 6, false)), m, parent)
  }
  const vector = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)
  // Connections below share the same analytic path as both characters.
  const pathY = (x: number) => .22 + .22 * (1 - (x / 6) ** 2)
  const pathZ = (x: number) => 2 + .32 * Math.sin(x * Math.PI / 6)
  // Low central front parapet clears the gesture; full-height side spans remain.
  const railHeight = (x: number, side: number) => side < 0 ? .78 :
    THREE.MathUtils.lerp(.09, .43, THREE.MathUtils.smoothstep(Math.abs(x), 1.8, 3.2))
  const qc = part('quezon-city-symbolic-urban-garden')
  qc.userData.description = 'A symbolic Quezon City skyline; no specific personal address or landmark.'
  qc.scale.set(2.1, 2.7, 2.1)
  qc.position.set(4, 1.8, -12)
  const baguio = part('baguio-symbolic-pine-terraces')
  baguio.userData.description = 'A symbolic mountain study destination, not her current location.'
  const landscape = createConnectionLandscape()
  group.add(landscape.group)
  // Architecture and the bridge now sit in continuous land, not circular display terraces.
  // QC: stepped crowns, cornices, inset doors, repeated warm window bays, a tree-lined promenade.
  const buildings = [[-10.1, -4.3, 1.3, 3.1], [-8.55, -4.9, 1.35, 4.5], [-6.8, -4.1, 1.5, 3.6],
    [-5.05, -4.8, 1.2, 5.2], [-3.9, -4.9, 1.05, 2.5], [-9.1, -2.5, 1.55, 2.1], [-5.8, -2.55, 1.65, 1.9]]
  buildings.forEach(([x, z, w, h], i) => {
    const base = .2, front = z + .7
    put('urban-masonry', box, i % 2 ? p.skyline : p.skyline2, x, base + h / 2, z, w, h, 1.4, qc)
    put('roof-cornice', box, p.paving, x, base + h, z, w + .12, .12, 1.54, qc)
    put('stepped-roof-crown', box, p.roof, x, base + h + .23, z, w * .58, .4, .85, qc)
    for (let floor = 0; floor < Math.floor(h / .55); floor++) {
      for (let col = 0; col < 3; col++) {
        const xx = x + (col - 1) * w * .27, yy = base + .45 + floor * .52
        put('deep-window-recess', box, p.darkWindow, xx, yy, front + .012, w * .2, .32, .04, qc)
        put('honey-window-pane', box, random() > .65 ? p.light : p.wall, xx, yy, front + .04, w * .145, .24, .025, qc)
        put('window-sill', box, p.paving, xx, yy - .18, front + .07, w * .23, .035, .12, qc)
      }
    }
    put('entry-surround', box, p.brass, x, .58, front + .035, .48, .76, .09, qc)
    put('entry-door', box, p.darkWindow, x, .56, front + .095, .36, .67, .04, qc)
    put('entry-transom', box, p.light, x, .83, front + .125, .28, .09, .02, qc)
  })
  for (let i = 0; i < 17; i++) {
    put('promenade-paving', box, p.paving, -11 + i * .49, .23, -.8, .46, .055, 1.05, qc)
  }
  for (const x of [-10.6, -8, -4.1]) {
    put('city-tree-trunk', cylinder, p.bark, x, 1, -.5, .095, 1.6, .095, qc)
    for (let j = 0; j < 4; j++) put('rounded-city-tree-canopy', sphere, j % 2 ? p.pineTip : p.pine,
      x + Math.sin(j * 2) * .38, 2 + (j % 2) * .35, -.5 + Math.cos(j * 2) * .3, .72, .7, .68, qc)
  }
  // Story chapters share a camera and landscape, but each has its own spatial vocabulary.
  // These are symbolic environments, not specific places or personal memories.
  const coast = part('la-union-coastal-grove')
  coast.userData.description = 'A warm shoreline representing her present place, La Union.'
  const frondGeometry = geometry(new THREE.LatheGeometry([
    new THREE.Vector2(0, 0), new THREE.Vector2(.18, .35), new THREE.Vector2(.25, .8),
    new THREE.Vector2(.12, 1.35), new THREE.Vector2(0, 1.8),
  ], 6))
  for (const [x, z, h] of [[-9, -1, 5.2], [-5, -4, 4.5], [3, -7, 5.6], [8, -3, 4.7]]) {
    const base = landscape.height(x, z)
    const crownX = x + .55
    tube('curved-coconut-palm-trunk', [vector(x, base, z), vector(x + .15, base + h * .5, z), vector(crownX, base + h, z)], .12, p.bark, coast, 12)
    for (let j = 0; j < 8; j++) {
      const a = j * Math.PI / 4
      put('arching-palm-frond', frondGeometry, j % 2 ? p.pine : p.pineTip,
        crownX, base + h, z, 1, 1, 1, coast, Math.cos(a) * 1.1, a, Math.sin(a) * 1.1)
    }
  }
  // A single ribbon road recedes into the mountain backdrop, its centerline sharing
  // the same continuous ground rather than introducing another display platform.
  const journey = part('coast-to-mountain-road')
  const roadVertices: number[] = [], roadIndices: number[] = []
  for (let i = 0; i <= 64; i++) {
    const z = 8 - i * .48, x = -2 + Math.sin(i * .045) * 4
    for (const side of [-1, 1]) roadVertices.push(x + side * 1.15, landscape.height(x + side * 1.15, z) + .08, z)
    if (i < 64) { const a = i * 2; roadIndices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3) }
  }
  const roadGeometry = geometry(new THREE.BufferGeometry())
  roadGeometry.setAttribute('position', new THREE.Float32BufferAttribute(roadVertices, 3))
  roadGeometry.setIndex(roadIndices); roadGeometry.computeVertexNormals()
  mesh('winding-mountain-road', roadGeometry, p.paving, journey)
  for (let i = 0; i < 16; i++) {
    const z = 6 - i * 1.6, x = -2 + Math.sin((8 - z) / .48 * .045) * 4
    put('road-center-marker', box, p.cream, x, landscape.height(x, z) + .11, z, .07, .025, .45, journey)
  }
  // Distant ridges span the horizon; they are not cutouts directly behind the cottage.
  for (let layer = 0; layer < 3; layer++) {
    const ridge = new THREE.Shape()
    ridge.moveTo(2.8, 0)
    for (let i = 0; i <= 60; i++) {
      const x = 2.8 + i * 10.4 / 60
      const shoulder = THREE.MathUtils.smoothstep(i / 60, 0, .4)
      const y = .65 + shoulder * (.65 + (2 - layer) * .55 + Math.sin(i * .065 + layer * .65) ** 2 * 1.7)
      ridge.lineTo(x, y)
    }
    ridge.lineTo(13.2, 0); ridge.closePath()
    const ridgeMaterial = material(['#405b70', '#365662', '#294b51'][layer])
    const mountain = mesh(`soft-mountain-ridgeline-${layer}`, geometry(new THREE.ExtrudeGeometry(ridge,
      { depth: .55, bevelEnabled: true, bevelSize: .15, bevelThickness: .15, bevelSegments: 2, steps: 1 })), ridgeMaterial, baguio)
    mountain.scale.set(4, 2.6, 2)
    mountain.position.set(-17, 2, -43 + layer * 7)
  }
  for (let tier = 0; tier < 3; tier++) {
    put('mountain-terrace-retaining-wall', box, p.stone, 7.5, .2 + tier * .13, -3.5 - tier * .75, 7.7 - tier * .65, .4 + tier * .26, 1.1, baguio)
    put('mountain-terrace-moss-cap', box, p.grass, 7.5, .415 + tier * .26, -3.5 - tier * .75, 7.75 - tier * .65, .03, 1.15, baguio)
  }
  // Cottage sits on the front terrace, with pitched roof, gable, seams and a sheltered porch.
  const house = part('pine-cottage-with-welcoming-porch', baguio)
  house.position.set(10, .65, -7.5)
  house.scale.setScalar(2)
  put('cottage-clapboard-body', box, p.wall, 0, .85, 0, 2.8, 1.7, 1.9, house)
  const gable = new THREE.Shape(); gable.moveTo(-1.4, 0); gable.lineTo(1.4, 0); gable.lineTo(0, 1.05); gable.closePath()
  const gableMesh = mesh('triangular-timber-gable', geometry(new THREE.ExtrudeGeometry(gable, { depth: 1.9, bevelEnabled: false })), p.wood, house)
  gableMesh.position.set(0, 1.7, -.95)
  const roofAngle = Math.atan2(1.12, 1.65)
  for (const side of [-1, 1]) {
    put('pitched-metal-roof', box, p.roof, side * .82, 2.23, 0, 1.99, .1, 2.4, house, 0, 0, -side * roofAngle)
    for (let i = 0; i < 9; i++) put('standing-roof-seam', box, p.brass, side * .82, 2.29, -1.1 + i * .275, 1.99, .027, .022, house, 0, 0, -side * roofAngle)
  }
  for (let row = 0; row < 8; row++) put('cladding-shadow-line', box, p.pine, 0, .2 + row * .2, .962, 2.76, .016, .015, house)
  put('cottage-door-trim', box, p.cream, 0, .64, 1, .68, 1.3, .11, house)
  put('cottage-recessed-door', box, p.wood, 0, .62, 1.07, .52, 1.18, .045, house)
  put('door-glazed-inset', box, p.light, 0, .9, 1.1, .29, .39, .022, house)
  put('brass-door-knob', sphere, p.brass, .17, .55, 1.13, .035, .035, .035, house)
  for (const x of [-.94, .94]) {
    put('cottage-window-trim', box, p.cream, x, .97, 1.01, .67, .79, .1, house)
    put('cottage-lit-window', box, p.light, x, .97, 1.07, .55, .66, .035, house)
    put('window-mullion', box, p.wood, x, .97, 1.1, .035, .7, .035, house)
    put('window-crossbar', box, p.wood, x, .97, 1.1, .57, .035, .035, house)
    put('window-planter', box, p.wood, x, .53, 1.16, .78, .17, .3, house)
    for (let j = 0; j < 5; j++) put('window-box-foliage', sphere, p.pineTip, x - .27 + j * .135, .66, 1.16, .12, .11, .15, house)
  }
  put('porch-deck', box, p.wood, 0, .06, 1.45, 3.1, .12, 1.05, house)
  for (let i = 0; i < 3; i++) put('porch-access-steps', box, p.stone, 0, -.1 - i * .11, 2.03 + i * .19, 1.15, .14, .3, house)
  for (const x of [-1.39, 1.39]) {
    put('porch-post', cylinder, p.wood, x, .59, 1.8, .06, 1.1, .06, house)
    put('porch-rail', box, p.cream, x, .74, 1.47, .07, .07, .7, house)
  }
  // Layered evergreen skirts use a curved lathed profile, not single placeholder cones.
  const pineGeometry = geometry(new THREE.LatheGeometry([
    new THREE.Vector2(0, 0), new THREE.Vector2(.7, .12), new THREE.Vector2(.54, .28),
    new THREE.Vector2(.43, .48), new THREE.Vector2(.34, .72), new THREE.Vector2(.2, 1.02), new THREE.Vector2(0, 1.4),
  ], 12))
  for (const [x, z, h] of [[4, -9, 5.8], [5, -14, 7.2], [15, -9, 7], [20, -16, 9], [16, -23, 8], [3.5, -4, 4.2], [18, -3, 6]]) {
    const base = landscape.height(x, z)
    put('pine-trunk', cylinder, p.bark, x, base + h * .35, z, .085, h * .7, .085, baguio)
    for (let tier = 0; tier < 3; tier++) {
      const s = h * (.43 - tier * .08)
      put('sculpted-pine-boughs', pineGeometry, tier === 2 ? p.pineTip : p.pine, x, base + h * (.15 + tier * .21), z, s, s, s, baguio, 0, tier * .7)
    }
  }
  // Landings meet the approach banks; piers extend into the tidal bed.
  for(const side of [-1,1]){
    for(let step=0;step<4;step++){
      const x=side*(6.15+step*.35)
      put('bank-landing-stone',box,p.stone,x,.12-step*.027,pathZ(side*6),.38,.22,1.65)
    }
    for(const zOffset of [-.58,.58])put('bridge-foundation-pier',cylinder,p.stone,side*3.6,-.25,pathZ(side*3.6)+zOffset,.13,1.3,.13)
  }
  // The walkable bridge is present from the start; luminous inlays progressively connect it.
  const pathPoints: THREE.Vector3[] = []
  for (let i = 0; i <= 96; i++) { const x = -6 + i / 8; pathPoints.push(vector(x, pathY(x), pathZ(x))) }
  for (let i = 0; i < 96; i++) {
    const x = -6 + (i + .5) / 8, tangent = Math.atan(.32 * Math.PI / 6 * Math.cos(x * Math.PI / 6))
    put('bridge-individual-deck-boards', box, p.wood, x, pathY(x) - .055, pathZ(x), .12, .11, 1.45, group, 0, -tangent)
    if (i % 4 === 0) {
      for (const side of [-1, 1]) {
        const z = pathZ(x) + side * .83, height = railHeight(x, side)
        put('bridge-baluster', cylinder, p.brass, x, pathY(x) + height / 2, z, .023, height, .023)
        put('baluster-finial', sphere, p.brass, x, pathY(x) + height, z, .045, .045, .045)
      }
    }
  }
  const thread = part('revealing-ribbon-of-light')
  const revealGeometries: Array<{ geometry: THREE.BufferGeometry; count: number; stride: number }> = []
  for (const side of [-1, 1]) {
    const railPoints = pathPoints.map(v => vector(v.x, v.y + railHeight(v.x, side), v.z + side * .83))
    const rail = tube(`continuous-brass-bridge-handrail-${side}`, railPoints, .028, p.brass)
    rail.userData.description = 'A physical railing, independent of the luminous reveal.'
    const light = tube(`golden-thread-${side}`, railPoints.map(v => v.clone().add(vector(0, .035, 0))), .021, p.luminous, thread, 128)
    revealGeometries.push({ geometry: light.geometry, count: 128 * 6 * 6, stride: 36 })
  }
  // Broad opaque ribbon in the boards: clear even with no bloom/postprocessing.
  const ribbonVertices: number[] = [], ribbonIndices: number[] = []
  pathPoints.forEach((v, i) => {
    ribbonVertices.push(v.x, v.y + .008, v.z - .055, v.x, v.y + .008, v.z + .055)
    if (i < 96) { const a = i * 2; ribbonIndices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2) }
  })
  const ribbonGeometry = geometry(new THREE.BufferGeometry())
  ribbonGeometry.setAttribute('position', new THREE.Float32BufferAttribute(ribbonVertices, 3)); ribbonGeometry.setIndex(ribbonIndices); ribbonGeometry.computeVertexNormals()
  const ribbonMaterial = p.luminous.clone(); ribbonMaterial.side = THREE.DoubleSide; materials.add(ribbonMaterial)
  mesh('walkway-honey-inlay', ribbonGeometry, ribbonMaterial, thread)
  revealGeometries.push({ geometry: ribbonGeometry, count: ribbonIndices.length, stride: 6 })
  // Botanical arch behind the meeting point keeps faces and silhouettes unobstructed.
  const arbor = part('central-jasmine-garden-arbor')
  arbor.position.z = -1.1
  arbor.scale.x = 1.3
  for (const x of [-1.8, 1.8]) {
    put('arbor-stone-foot', cylinder, p.stone, x, .16, .25, .28, .32, .28, arbor)
    put('arbor-upright', cylinder, p.brass, x, 1.45, .25, .055, 2.6, .055, arbor)
  }
  const archPoints: THREE.Vector3[] = []
  for (let i = 0; i <= 40; i++) { const a = Math.PI * i / 40; archPoints.push(vector(Math.cos(a) * 1.8, 2.7 + Math.sin(a) * 1.3, .25)) }
  tube('curved-brass-botanical-arch', archPoints, .065, p.brass, arbor, 48)
  for (let i = 0; i < 36; i++) {
    const a = random() * Math.PI, x = Math.cos(a) * 1.8, y = 2.7 + Math.sin(a) * 1.3
    put('arbor-jasmine-leaves', sphere, i % 3 ? p.pine : p.pineTip, x + (random() - .5) * .3, y, .25 + (random() - .5) * .3,
      .18, .07, .11, arbor, 0, random() * 6, a)
    if (i % 4 === 0) put('arbor-ivory-blossoms', sphere, p.petals, x, y + .1, .42, .07, .05, .07, arbor)
  }
  function lantern(x: number, z: number, base = .2) {
    put('lantern-pedestal', cylinder, p.stone, x, base + .07, z, .2, .14, .2)
    put('lantern-stem', cylinder, p.brass, x, base + .62, z, .035, 1.1, .035)
    put('lantern-honey-glass', box, p.light, x, base + 1.27, z, .22, .32, .22)
    put('lantern-roof', cone, p.roof, x, base + 1.51, z, .24, .19, .24)
    for (const xx of [-.13, .13]) for (const zz of [-.13, .13]) put('lantern-metal-cage', cylinder, p.brass, x + xx, base + 1.27, z + zz, .012, .38, .012)
  }
  for (const [x, z] of [[-6.2, .55], [6.2, .55], [-2.5, 3.4], [2.5, 3.4], [-10.7, -1.5], [10.7, -1.5]]) lantern(x, z)
  for (const x of [-1.6, 1.6]) {
    const light = new THREE.PointLight('#ffd395', 8, 6, 2); light.position.set(x, 2.3, 2); light.name = 'garden-lantern-local-light'; group.add(light)
  }
  // Flower beds are grounded and instanced: hundreds of details in four draws.
  for (let i = 0; i < 160; i++) {
    const x = (random() - .5) * 23, z = random() * 5.1 + 1
    if (Math.abs(x) < 6.5 && Math.abs(z - pathZ(x)) < 1.15) continue
    if (Math.abs(x) < 2.5) continue
    const h = .14 + random() * .29
    put('wildflower-stems', cylinder, p.pineTip, x, h / 2, z, .012, h, .012)
    for (let j = 0; j < 5; j++) {
      const a = j * Math.PI * 2 / 5
      put('wildflower-petals', sphere, i % 3 ? p.petals : p.lavender, x + Math.cos(a) * .065, h, z + Math.sin(a) * .065, .077, .025, .043, group, 0, -a)
    }
    put('wildflower-pollen', sphere, p.brass, x, h + .025, z, .035, .03, .035)
  }
  // Symbolic sculptural people. Local +Z is their gaze; no invented likenesses.
  function person(feminine: boolean) {
    const root = part(feminine ? 'female-recipient-sculpture' : 'male-sender-sculpture')
    root.userData.description = 'Symbolic character, not a portrait.'
    const body = part('tailored-figure', root)
    if (feminine) {
      const skirt = geometry(tailoredGarment([[.44,.5,.4],[.49,.52,.42],[.7,.46,.37],[.95,.37,.3],[1.2,.29,.24],[1.36,.285,.235]],.045))
      put('pleated-ochre-dress-skirt', skirt, p.dress, 0, 0, 0, 1, 1, 1, body)
      const bodice = geometry(tailoredGarment([[1.35,.285,.235],[1.48,.29,.23],[1.67,.32,.235],[1.82,.29,.21],[1.94,.15,.14]]))
      put('shaped-seamed-dress-bodice', bodice, p.dress, 0, 0, 0, 1, 1, 1, body)
      put('dress-waistband', cylinder, p.brass, 0, 1.36, 0, .3, .045, .245, body)
      put('long-hair-back', sphere, p.hair, 0, 2.13, -.14, .3, .52, .22, body)
      put('hair-gathered-ribbon', sphere, p.brass, 0, 1.94, -.33, .09, .055, .035, body)
    } else {
      const jacket = geometry(tailoredGarment([[1.12,.32,.22],[1.2,.35,.235],[1.45,.32,.24],[1.7,.36,.25],[1.86,.35,.23],[1.98,.16,.14]]))
      put('cut-and-sewn-jacket-shell', jacket, p.coat, 0, 0, 0, 1, 1, 1, body)
      put('ivory-shirt-front', sphere, p.cream, 0, 1.7, .215, .13, .29, .035, body)
      for (const side of [-1, 1]) put('jacket-lapel', box, p.coat, side * .12, 1.83, .24, .11, .29, .045, body, 0, 0, side * .29)
      for (let j = 0; j < 3; j++) put('jacket-brass-buttons', sphere, p.brass, .05, 1.6 - j * .13, .255, .019, .019, .018, body)
      put('short-swept-hair', sphere, p.hair, 0, 2.46, -.03, .29, .2, .26, body)
      put('side-swept-fringe', sphere, p.hair, -.1, 2.42, .17, .21, .11, .13, body, 0, 0, -.27)
    }
    for (const side of [-1, 1]) {
      put('shaped-standing-leg', capsule, feminine ? p.skin : p.trousers, side * .16, .55, 0, .105, .26, .115, body)
      put('rounded-leather-shoe', sphere, p.shoes, side * .16, .075, .075, .135, .075, .23, body)
    }
    put('neck', cylinder, p.skin, 0, 2.015, 0, .1, .23, .11, body)
    put('sculpted-head', sphere, p.skin, 0, 2.29, .015, .255, .32, .245, body)
    put('subtle-nose-profile', sphere, p.skin, 0, 2.28, .25, .05, .065, .065, body)
    for (const side of [-1, 1]) {
      put('ear', sphere, p.skin, side * .25, 2.27, 0, .05, .08, .06, body)
      put('quiet-eye', sphere, p.hair, side * .095, 2.34, .232, .016, .021, .012, body)
    }
    if (feminine) {
      put('soft-parted-hair-crown', sphere, p.hair, 0, 2.49, -.04, .28, .16, .26, body)
      for (const side of [-1, 1]) put('face-framing-hair', sphere, p.hair, side * .235, 2.29, .025, .08, .3, .17, body)
    }
    const arm = part('reaching-arm', root)
    // Shoulder-local pivot avoids orbiting the limb around the feet on approach.
    const side = feminine ? 1 : -1
    arm.position.set(side * .35, 1.72, .08)
    const sleeveMaterial = feminine ? p.dress : p.coat
    put('rounded-sleeve', capsule, sleeveMaterial, 0, 0, 0, .12, .18, .12, arm, -.35, 0, side * .1)
    tube('gently-bent-forearm', [vector(side * .02, -.18, .08), vector(-side * .1, -.28, .35), vector(-side * .332, -.24, .56)], .065, p.skin, arm, 16)
    // Actual palm meshes are individually inspectable; geometry/material stay shared.
    // They stop on their own side of the midpoint rather than crossing through it.
    const hand = mesh('open-reaching-hand', sphere, p.skin, arm)
    hand.position.set(-side * .332, -.24, .62); hand.scale.set(.068, .05, .075)
    hand.castShadow = true; hand.receiveShadow = true
    put('reaching-thumb', sphere, p.skin, -side * .28, -.215, .615, .036, .035, .047, arm, 0, side * .3)
    put('relaxed-far-sleeve', capsule, sleeveMaterial, -side * .36, 1.65, 0, .12, .21, .12, body, 0, 0, -side * .16)
    put('relaxed-far-hand', sphere, p.skin, -side * .4, 1.25, .025, .075, .11, .075, body)
    return { root, arm }
  }
  const man = person(false), woman = person(true)
  const male = man.root, female = woman.root
  const starVertices: number[] = []
  for (let i = 0; i < 125; i++) starVertices.push((random() - .5) * 27, 5.6 + random() * 5.2, -7.5 + random() * 4)
  const starsGeometry = geometry(new THREE.BufferGeometry())
  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3))
  const starsMaterial = new THREE.PointsMaterial({ color: '#f3dfb6', size: .035, sizeAttenuation: true, toneMapped: false })
  materials.add(starsMaterial)
  const stars = new THREE.Points(starsGeometry, starsMaterial); stars.name = 'twilight-stars'; group.add(stars)
  const mistMaterial = new THREE.MeshBasicMaterial({ color: '#a1b9b8', transparent: true, opacity: .09, depthWrite: false })
  materials.add(mistMaterial)
  const mist = mesh('single-soft-mountain-mist-bank', sphere, mistMaterial)
  mist.position.set(7.1, 1.5, -4.9); mist.scale.set(5, .24, .75)
  // Seal all repeated geometry into local instance batches; characters retain their own transforms.
  for (const [parent, buckets] of batches) for (const batch of buckets.values()) {
    const object = new THREE.InstancedMesh(batch.geometry, batch.material, batch.matrices.length)
    object.name = `${parent.name || 'stage'}:${[...batch.names].slice(0, 2).join('+')}`
    object.userData.parts = [...batch.names]
    batch.matrices.forEach((matrix, i) => object.setMatrixAt(i, matrix))
    object.instanceMatrix.needsUpdate = true; object.computeBoundingSphere()
    object.castShadow = batch.material !== p.light && batch.material !== p.luminous
    object.receiveShadow = true
    parent.add(object); instanced.push(object)
  }
  batches.clear()
  // The city shares palette materials with the rest of the world. Give its
  // batches their own materials so revealing it never fades the landscape.
  const cityMaterials = new Map<THREE.Material, THREE.Material>()
  qc.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return
    const isolate = (original: THREE.Material) => {
      let copy = cityMaterials.get(original)
      if (!copy) { copy = original.clone(); cityMaterials.set(original, copy); materials.add(copy) }
      return copy
    }
    object.material = Array.isArray(object.material) ? object.material.map(isolate) : isolate(object.material)
  })
  function setProgress(value: number, reduced: boolean) {
    if (disposed) return
    const progress = Number.isFinite(value) ? THREE.MathUtils.clamp(value, 0, 1) : 0
    const connection = THREE.MathUtils.smoothstep(progress, .2, .65)
    // Keep the symbolic city out of the coastal and mountain views.
    // Its reveal belongs to the imagined shared garden, not her present location.
    const cityReveal = THREE.MathUtils.smoothstep(progress, .75, .9)
    qc.visible = cityReveal > 0
    for (const [original, copy] of cityMaterials) {
      copy.opacity = original.opacity * cityReveal
      const fading = cityReveal < 1
      const transparent = original.transparent || fading
      if (copy.transparent !== transparent) { copy.transparent = transparent; copy.needsUpdate = true }
      copy.depthWrite = fading ? false : original.depthWrite
    }
    thread.visible = connection > 0
    for (const item of revealGeometries) item.geometry.setDrawRange(0, Math.floor(item.count * connection / item.stride) * item.stride)
    const approach = THREE.MathUtils.smoothstep(progress, .65, 1)
    const x = THREE.MathUtils.lerp(6, .73, approach)
    male.position.set(-x, pathY(-x), pathZ(-x)); female.position.set(x, pathY(x), pathZ(x))
    const facing = Math.atan2(2 * x, pathZ(x) - pathZ(-x))
    male.rotation.y = facing; female.rotation.y = facing - Math.PI
    // A small gait is scroll-driven (never time-driven); both feet settle at the final pose.
    const gait = reduced ? 0 : Math.sin(approach * Math.PI * 10) * Math.sin(approach * Math.PI) * .018
    male.rotation.z = gait; female.rotation.z = -gait
    man.arm.rotation.x = -.12 * (1 - approach); woman.arm.rotation.x = -.12 * (1 - approach)
    group.updateMatrixWorld(true)
  }
  setProgress(0, true)
  return {
    group, male, female, thread, setProgress,
    update(time: number, _delta: number, reduced: boolean) {
      if (disposed) return
      const t = reduced || !Number.isFinite(time) ? 0 : time
      landscape.update(t, reduced)
      mist.position.x = 7.1 + Math.sin(t * .08) * .35
      starsMaterial.size = .035 + Math.sin(t * .35) * .003
    },
    dispose() {
      if (disposed) return
      disposed = true
      landscape.dispose()
      textures.forEach(texture => texture.dispose())
      instanced.forEach(object => object.dispose())
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose())
      instanced.length = 0; geometries.clear(); materials.clear()
      group.removeFromParent(); group.clear()
    },
  }
}
