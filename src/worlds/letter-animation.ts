import * as THREE from 'three'

/** A self-contained envelope. The caller owns camera motion, timing and accessible text. */
export function createLetterAnimation(parent: THREE.Object3D) {
  const root = new THREE.Group()
  root.name = 'animated-letter'
  // createWorld's static geometry batcher must not merge animated descendants.
  root.userData.keep = true
  parent.add(root)
  const geometries: THREE.BufferGeometry[] = []
  const materials = [new THREE.MeshStandardMaterial({ color: '#f5e9ce', roughness: .94 }), new THREE.MeshStandardMaterial({ color: '#e9d9b7', roughness: .9 }), new THREE.MeshStandardMaterial({ color: '#bc7967', roughness: .85 })]
  const mesh = (geometry: THREE.BufferGeometry, material: THREE.Material, container: THREE.Object3D) => {
    geometries.push(geometry)
    const object = new THREE.Mesh(geometry, material)
    object.castShadow = true
    object.receiveShadow = true
    container.add(object)
    return object
  }
  const base = mesh(new THREE.BoxGeometry(1.05, .075, .72), materials[0], root)
  base.name = 'envelope-paper'
  base.position.y = .045
  const hinge = new THREE.Group()
  hinge.name = 'letter-flap-hinge'
  hinge.position.set(0, .088, -.32)
  root.add(hinge)
  const shape = new THREE.Shape().moveTo(-.5, 0).lineTo(.5, 0).lineTo(0, .45).closePath()
  const flap = mesh(new THREE.ShapeGeometry(shape), materials[1], hinge)
  flap.name = 'triangular-envelope-flap'
  flap.rotation.x = -Math.PI / 2
  const seal = mesh(new THREE.CylinderGeometry(.095, .095, .035, 16), materials[2], hinge)
  seal.name = 'wax-seal'
  seal.position.set(0, .02, .36)
  const paper = mesh(new THREE.BoxGeometry(.87, .018, .58), materials[0], root)
  paper.name = 'letter-emerging-paper'
  paper.position.set(0, .085, 0)
  let disposed = false
  const setProgress = (progress: number) => {
    if (disposed) return
    const p = Number.isFinite(progress) ? THREE.MathUtils.clamp(progress, 0, 1) : 0
    const opening = THREE.MathUtils.smoothstep(p, 0, .65)
    const reveal = THREE.MathUtils.smoothstep(p, .3, 1)
    hinge.rotation.x = Math.PI * .94 * opening
    paper.position.z = reveal === 0 ? 0 : -.48 * reveal
    paper.position.y = .085 + .035 * reveal
  }
  return { setProgress, dispose() {
    if (disposed) return
    disposed = true
    root.removeFromParent()
    geometries.forEach(geometry => geometry.dispose())
    materials.forEach(material => material.dispose())
    root.clear()
  } }
}
