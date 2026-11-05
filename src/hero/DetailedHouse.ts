import * as THREE from 'three'

/**
 * Detailed procedural house model for the hero environment
 * Premium architectural geometry with proper materials
 */

export interface HouseOptions {
  position?: THREE.Vector3
  rotation?: number
  scale?: number
}

export function createDetailedHouse(options: HouseOptions = {}): THREE.Group {
  const house = new THREE.Group()
  house.name = 'detailed-house'
  
  const { position = new THREE.Vector3(0, 0, 0), rotation = 0, scale = 1 } = options
  
  house.position.copy(position)
  house.rotation.y = rotation
  house.scale.setScalar(scale)

  const geometries: THREE.BufferGeometry[] = []
  const materials: THREE.Material[] = []

  // Helper functions
  const geo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g)
    return g
  }

  const mat = (color: string, roughness = 0.85, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness })
    materials.push(m)
    return m
  }

  // Material palette
  const palette = {
    walls: mat('#e8dcc8', 0.9, 0),
    darkWood: mat('#5a4738', 0.88, 0),
    wood: mat('#9b7e5c', 0.85, 0),
    roof: mat('#4a3f3a', 0.92, 0),
    roofTiles: mat('#62534a', 0.9, 0),
    trim: mat('#f5ead6', 0.92, 0),
    windowGlass: mat('#93b5c6', 0.15, 0.1),
    windowFrame: mat('#8b7355', 0.88, 0),
    door: mat('#735a48', 0.9, 0),
    stone: mat('#b5a895', 0.95, 0),
    metal: mat('#8a8580', 0.4, 0.6)
  }

  const box = geo(new THREE.BoxGeometry(1, 1, 1))
  const cylinder = geo(new THREE.CylinderGeometry(1, 1, 1, 16))

  function mesh(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    parent: THREE.Object3D,
    x = 0, y = 0, z = 0,
    sx = 1, sy = 1, sz = 1
  ): THREE.Mesh {
    const m = new THREE.Mesh(geometry, material)
    m.position.set(x, y, z)
    m.scale.set(sx, sy, sz)
    m.castShadow = true
    m.receiveShadow = true
    parent.add(m)
    return m
  }

  // Foundation
  mesh(box, palette.stone, house, 0, 0.3, 0, 5.8, 0.6, 4.2)

  // Main walls
  mesh(box, palette.walls, house, 0, 2.2, 0, 5.6, 3.2, 4)
  
  // Detailed window frames (front facade)
  for (const [x, y] of [[-1.8, 2.2], [1.8, 2.2]]) {
    // Window recess
    mesh(box, palette.walls, house, x, y, 2.05, 1.2, 1.4, 0.08)
    // Glass
    mesh(box, palette.windowGlass, house, x, y, 2.1, 1.05, 1.25, 0.05)
    // Frame components
    mesh(box, palette.windowFrame, house, x, y, 2.13, 1.15, 0.06, 0.06) // horizontal center
    mesh(box, palette.windowFrame, house, x, y, 2.13, 0.06, 1.3, 0.06) // vertical center
    // Outer frame
    for (const dx of [-0.6, 0.6]) {
      mesh(box, palette.trim, house, x + dx, y, 2.14, 0.06, 1.35, 0.07)
    }
    for (const dy of [-0.68, 0.68]) {
      mesh(box, palette.trim, house, x, y + dy, 2.14, 1.25, 0.06, 0.07)
    }
    // Window sill
    mesh(box, palette.trim, house, x, y - 0.75, 2.08, 1.35, 0.12, 0.25)
  }

  // Front door
  mesh(box, palette.door, house, 0, 1.3, 2.05, 1.1, 2.4, 0.12)
  mesh(cylinder, palette.metal, house, 0.35, 1.3, 2.12, 0.04, 0.04, 0.04) // doorknob
  mesh(box, palette.trim, house, 0, 1.3, 2.07, 0.15, 2.5, 0.08) // door trim vertical
  mesh(box, palette.trim, house, 0, 2.52, 2.07, 1.2, 0.15, 0.08) // door trim top

  // Side windows
  mesh(box, palette.windowGlass, house, -2.85, 2.2, 0, 0.05, 1.0, 0.9)
  mesh(box, palette.windowFrame, house, -2.88, 2.2, 0, 0.06, 1.1, 1.0)
  mesh(box, palette.windowGlass, house, 2.85, 2.2, 0, 0.05, 1.0, 0.9)
  mesh(box, palette.windowFrame, house, 2.88, 2.2, 0, 0.06, 1.1, 1.0)

  // Roof structure with detailed geometry
  const roofGroup = new THREE.Group()
  roofGroup.name = 'roof-assembly'
  house.add(roofGroup)

  // Main roof planes (gabled)
  const roofLeft = mesh(box, palette.roof, roofGroup, -1.4, 4.5, 0, 3.8, 0.18, 5)
  roofLeft.rotation.z = Math.PI * 0.3
  
  const roofRight = mesh(box, palette.roof, roofGroup, 1.4, 4.5, 0, 3.8, 0.18, 5)
  roofRight.rotation.z = -Math.PI * 0.3

  // Roof tiles (individual ridge tiles)
  for (let i = 0; i < 24; i++) {
    const z = -2.3 + i * 0.2
    mesh(cylinder, palette.roofTiles, roofGroup, 0, 5.65, z, 0.14, 0.08, 0.14)
  }

  // Chimney
  const chimneyX = 1.5
  const chimneyZ = -0.8
  mesh(box, palette.stone, house, chimneyX, 4.8, chimneyZ, 0.65, 2.4, 0.65)
  mesh(box, palette.stone, house, chimneyX, 6.15, chimneyZ, 0.8, 0.3, 0.8)
  mesh(box, palette.metal, house, chimneyX, 6.45, chimneyZ, 0.35, 0.45, 0.35)

  // Decorative trim and details
  // Corner posts
  for (const x of [-2.75, 2.75]) {
    for (const z of [-1.95, 1.95]) {
      mesh(cylinder, palette.trim, house, x, 2.2, z, 0.12, 3.4, 0.12)
    }
  }

  // Horizontal trim band
  mesh(box, palette.trim, house, 0, 3.75, 2.02, 5.7, 0.12, 0.08)
  mesh(box, palette.trim, house, 0, 3.75, -2.02, 5.7, 0.12, 0.08)

  // Porch/entrance overhang
  const porchRoof = mesh(box, palette.roof, house, 0, 3.5, 2.8, 2.2, 0.12, 1.2)
  porchRoof.rotation.x = -0.15
  // Porch support columns
  mesh(cylinder, palette.darkWood, house, -0.9, 1.8, 2.6, 0.09, 3, 0.09)
  mesh(cylinder, palette.darkWood, house, 0.9, 1.8, 2.6, 0.09, 3, 0.09)

  // Small balcony (second floor front)
  mesh(box, palette.wood, house, 0, 3.3, 2.15, 1.8, 0.08, 0.6)
  // Balcony railing
  for (let i = 0; i < 7; i++) {
    const x = -0.8 + i * 0.27
    mesh(cylinder, palette.windowFrame, house, x, 3.65, 2.4, 0.03, 0.6, 0.03)
  }
  mesh(cylinder, palette.windowFrame, house, 0, 3.92, 2.4, 0.9, 0.05, 0.05)

  // Small attic window (gable end)
  mesh(box, palette.windowGlass, house, 0, 4.9, 2.05, 0.5, 0.5, 0.05)
  mesh(box, palette.windowFrame, house, 0, 4.9, 2.08, 0.56, 0.56, 0.06)

  // Ground-level details
  // Stone pathway to door
  for (let i = 0; i < 5; i++) {
    const z = 3.5 + i * 0.55
    mesh(cylinder, palette.stone, house, 0, 0.02, z, 0.45, 0.04, 0.4)
  }

  // Flower boxes under front windows
  for (const x of [-1.8, 1.8]) {
    mesh(box, palette.darkWood, house, x, 1.4, 2.2, 1.1, 0.25, 0.3)
  }

  // Dispose function
  house.userData.dispose = () => {
    geometries.forEach(g => g.dispose())
    materials.forEach(m => m.dispose())
  }

  return house
}
