import * as THREE from 'three'
import { gsap } from 'gsap'

/**
 * Enhanced environment with detailed vegetation, terrain, and atmospheric effects
 */

export interface EnvironmentAssets {
  trees: THREE.Group[]
  flowers: THREE.Group[]
  terrain: THREE.Mesh
  atmosphere: {
    clouds: THREE.Group
    fog: THREE.FogExp2
  }
  dispose: () => void
}

const geometries = new Set<THREE.BufferGeometry>()
const materials = new Set<THREE.Material>()

function geo<T extends THREE.BufferGeometry>(g: T): T {
  geometries.add(g)
  return g
}

function mat(color: string, roughness = 0.85, metalness = 0): THREE.MeshStandardMaterial {
  const m = new THREE.MeshStandardMaterial({ color, roughness, metalness })
  materials.add(m)
  return m
}

/**
 * Detailed pine tree with individual branch layers
 */
export function createDetailedPineTree(
  height: number,
  position: THREE.Vector3,
  variation = 0
): THREE.Group {
  const tree = new THREE.Group()
  tree.position.copy(position)
  tree.name = 'pine-tree'

  const barkMat = mat('#4a3832', 0.95)
  const needlesMat = mat('#2d4a3e', 0.92)
  const needlesLight = mat('#3d5a48', 0.9)

  const trunk = new THREE.Mesh(
    geo(new THREE.CylinderGeometry(0.15, 0.18, height, 8)),
    barkMat
  )
  trunk.position.y = height / 2
  trunk.castShadow = true
  trunk.receiveShadow = true
  tree.add(trunk)

  // Branch layers - decreasing size toward top
  const layers = Math.floor(height * 2.5)
  for (let i = 0; i < layers; i++) {
    const layerY = (i / layers) * height + 0.5
    const layerSize = (1 - i / layers) * height * 0.35
    const branchCount = 5 + Math.floor(variation * 2)

    for (let j = 0; j < branchCount; j++) {
      const angle = (j / branchCount) * Math.PI * 2 + i * 0.6
      const reach = layerSize * (0.8 + variation * 0.3)
      
      const branch = new THREE.Mesh(
        geo(new THREE.ConeGeometry(reach * 0.5, reach * 1.2, 6, 1, false, 0, Math.PI * 2)),
        i % 2 === 0 ? needlesMat : needlesLight
      )
      
      branch.position.set(
        Math.cos(angle) * reach * 0.3,
        layerY,
        Math.sin(angle) * reach * 0.3
      )
      branch.rotation.z = Math.cos(angle) * 0.25
      branch.rotation.x = Math.sin(angle) * 0.25
      branch.castShadow = true
      tree.add(branch)
    }
  }

  // Crown
  const crown = new THREE.Mesh(
    geo(new THREE.ConeGeometry(height * 0.12, height * 0.25, 8)),
    needlesMat
  )
  crown.position.y = height + height * 0.125
  crown.castShadow = true
  tree.add(crown)

  return tree
}

/**
 * Detailed flower with individual petals
 */
export function createDetailedFlower(
  scale: number,
  position: THREE.Vector3,
  petalColor: string
): THREE.Group {
  const flower = new THREE.Group()
  flower.position.copy(position)
  flower.name = 'flower'

  const stemMat = mat('#4a6e3d', 0.88)
  const petalMat = mat(petalColor, 0.82)
  const centerMat = mat('#f4d56e', 0.75)

  // Stem
  const stem = new THREE.Mesh(
    geo(new THREE.CylinderGeometry(0.015 * scale, 0.02 * scale, 0.8 * scale, 6)),
    stemMat
  )
  stem.position.y = 0.4 * scale
  stem.castShadow = true
  flower.add(stem)

  // Leaf
  const leafShape = new THREE.Shape()
  leafShape.moveTo(0, 0)
  leafShape.quadraticCurveTo(0.1 * scale, 0.15 * scale, 0, 0.25 * scale)
  leafShape.quadraticCurveTo(-0.1 * scale, 0.15 * scale, 0, 0)
  
  const leaf = new THREE.Mesh(
    geo(new THREE.ShapeGeometry(leafShape)),
    mat('#5a7e4d', 0.85)
  )
  leaf.position.set(0.08 * scale, 0.3 * scale, 0)
  leaf.rotation.y = Math.PI / 4
  flower.add(leaf)

  // Petals (7 individual petals)
  const petalCount = 7
  const petalRadius = 0.18 * scale
  
  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2
    const petal = new THREE.Mesh(
      geo(new THREE.SphereGeometry(0.08 * scale, 8, 6)),
      petalMat
    )
    
    petal.position.set(
      Math.cos(angle) * petalRadius,
      0.85 * scale,
      Math.sin(angle) * petalRadius
    )
    petal.scale.set(1.2, 0.4, 0.7)
    petal.rotation.y = -angle
    petal.rotation.z = 0.3
    petal.castShadow = true
    flower.add(petal)
  }

  // Center
  const center = new THREE.Mesh(
    geo(new THREE.SphereGeometry(0.06 * scale, 8, 6)),
    centerMat
  )
  center.position.y = 0.88 * scale
  center.scale.set(1, 0.6, 1)
  center.castShadow = true
  flower.add(center)

  return flower
}

/**
 * Natural terrain with elevation variation
 */
export function createDetailedTerrain(
  width: number,
  depth: number,
  baseColor: string
): THREE.Mesh {
  const segments = 128
  const geometry = geo(new THREE.PlaneGeometry(width, depth, segments, segments))
  geometry.rotateX(-Math.PI / 2)

  const positions = geometry.attributes.position
  const colors = new Float32Array(positions.count * 3)
  
  // Perlin-like noise for terrain height
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i)
    const z = positions.getZ(i)
    
    // Multiple octaves of noise for natural terrain
    const height = 
      Math.sin(x * 0.1) * Math.cos(z * 0.08) * 0.3 +
      Math.sin(x * 0.25) * Math.sin(z * 0.22) * 0.15 +
      Math.sin(x * 0.5) * Math.cos(z * 0.45) * 0.08 +
      Math.random() * 0.05
    
    positions.setY(i, height)

    // Color variation
    const colorVariation = 0.92 + Math.sin(x * 0.3 + z * 0.4) * 0.04 + Math.random() * 0.04
    colors[i * 3] = colorVariation
    colors[i * 3 + 1] = colorVariation
    colors[i * 3 + 2] = colorVariation
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.computeVertexNormals()

  const material = mat(baseColor, 0.95)
  material.vertexColors = true

  const terrain = new THREE.Mesh(geometry, material)
  terrain.receiveShadow = true
  terrain.name = 'terrain'

  return terrain
}

/**
 * Animated clouds with smooth motion
 */
export function createAtmosphericClouds(): THREE.Group {
  const cloudGroup = new THREE.Group()
  cloudGroup.name = 'clouds'

  const cloudMat = new THREE.MeshBasicMaterial({
    color: '#ffffff',
    transparent: true,
    opacity: 0.4,
    depthWrite: false
  })
  materials.add(cloudMat)

  const sphereGeo = geo(new THREE.SphereGeometry(1, 10, 8))

  // Create 8 cloud banks
  for (let i = 0; i < 8; i++) {
    const cloud = new THREE.Group()
    cloud.position.set(
      -30 + i * 8 + Math.random() * 4,
      12 + Math.random() * 3,
      -35 - Math.random() * 15
    )

    // Each cloud is 4-6 overlapping spheres
    const lobes = 4 + Math.floor(Math.random() * 3)
    for (let j = 0; j < lobes; j++) {
      const lobe = new THREE.Mesh(sphereGeo, cloudMat)
      lobe.position.set(
        j * 1.5 + Math.random() * 0.5,
        Math.sin(j * 0.8) * 0.4,
        Math.random() * 0.3
      )
      lobe.scale.set(
        2.5 + Math.random() * 1,
        0.6 + Math.random() * 0.3,
        1.5 + Math.random() * 0.8
      )
      cloud.add(lobe)
    }

    cloudGroup.add(cloud)

    // Animate cloud drift
    const startX = cloud.position.x
    gsap.to(cloud.position, {
      x: startX + Math.sin(i * 0.7) * 4,
      duration: 8 + i * 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })
  }

  return cloudGroup
}

/**
 * Complete environment assembly
 */
export function createHeroEnvironment(): EnvironmentAssets {
  const trees: THREE.Group[] = []
  const flowers: THREE.Group[] = []

  // Create terrain
  const terrain = createDetailedTerrain(120, 120, '#8b9b7a')

  // Place trees in natural-looking clusters
  const treePositions = [
    // Background forest
    ...Array.from({ length: 25 }, (_, i) => ({
      x: -40 + i * 3.5,
      z: -20 - Math.random() * 25,
      height: 3.5 + Math.random() * 2.5
    })),
    // Side clusters
    ...Array.from({ length: 8 }, (_, i) => ({
      x: -15 - Math.random() * 5,
      z: -8 + i * 2,
      height: 3 + Math.random() * 1.5
    })),
    ...Array.from({ length: 8 }, (_, i) => ({
      x: 15 + Math.random() * 5,
      z: -8 + i * 2,
      height: 3 + Math.random() * 1.5
    }))
  ]

  treePositions.forEach(({ x, z, height }) => {
    const tree = createDetailedPineTree(height, new THREE.Vector3(x, 0, z), Math.random())
    trees.push(tree)
  })

  // Place flowers in clusters
  const flowerColors = ['#f5e6d3', '#e8c4b8', '#d4a5a5', '#b8a4c9']
  const flowerClusters = [
    { x: -4, z: 4, count: 12 },
    { x: 3, z: 5, count: 10 },
    { x: -6, z: -2, count: 8 },
    { x: 5, z: -3, count: 9 }
  ]

  flowerClusters.forEach(cluster => {
    for (let i = 0; i < cluster.count; i++) {
      const flower = createDetailedFlower(
        0.6 + Math.random() * 0.4,
        new THREE.Vector3(
          cluster.x + (Math.random() - 0.5) * 2,
          0,
          cluster.z + (Math.random() - 0.5) * 2
        ),
        flowerColors[Math.floor(Math.random() * flowerColors.length)]
      )
      flowers.push(flower)
    }
  })

  // Create atmospheric elements
  const clouds = createAtmosphericClouds()
  const fog = new THREE.FogExp2('#c9e2e1', 0.015)

  return {
    trees,
    flowers,
    terrain,
    atmosphere: { clouds, fog },
    dispose: () => {
      geometries.forEach(g => g.dispose())
      materials.forEach(m => m.dispose())
    }
  }
}
