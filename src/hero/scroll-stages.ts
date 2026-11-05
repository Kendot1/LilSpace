import * as THREE from 'three'

/**
 * Five cinematic camera stages for the scroll-driven hero
 * Inspired by daikifujita.com's scroll choreography
 */

export interface CameraStage {
  id: string
  label: string
  headline: string
  description: string
  camera: {
    position: THREE.Vector3
    lookAt: THREE.Vector3
    fov?: number
  }
  duration: number
}

export const heroStages: CameraStage[] = [
  {
    id: 'stage-1',
    label: 'A Little World',
    headline: 'A place made for you',
    description: 'Between the coast and mountains, a small world waits.',
    camera: {
      position: new THREE.Vector3(12, 8, 16),
      lookAt: new THREE.Vector3(0, 2, -4),
      fov: 45
    },
    duration: 1.4
  },
  {
    id: 'stage-2',
    label: 'A Peaceful View',
    headline: 'Where earth meets sky',
    description: 'Flowers, pathways, and the quietness of home.',
    camera: {
      position: new THREE.Vector3(6, 3, 10),
      lookAt: new THREE.Vector3(0, 1.5, -2),
      fov: 50
    },
    duration: 1.4
  },
  {
    id: 'stage-3',
    label: 'Details All Around',
    headline: 'Built with care',
    description: 'Every corner holds something to discover.',
    camera: {
      position: new THREE.Vector3(-4, 6, 8),
      lookAt: new THREE.Vector3(0, 3, -2),
      fov: 48
    },
    duration: 1.5
  },
  {
    id: 'stage-4',
    label: 'The Whole Picture',
    headline: 'See it all together',
    description: 'The landscape unfolds beneath you.',
    camera: {
      position: new THREE.Vector3(0, 14, 5),
      lookAt: new THREE.Vector3(0, 0, -8),
      fov: 55
    },
    duration: 1.5
  },
  {
    id: 'stage-5',
    label: 'Our Little Space',
    headline: 'Welcome home',
    description: 'This is your place. Always here, always yours.',
    camera: {
      position: new THREE.Vector3(8, 5, 11),
      lookAt: new THREE.Vector3(-1, 2.5, -3),
      fov: 46
    },
    duration: 1.6
  }
]

/**
 * Interpolates between two camera stages
 */
export function lerpCameraStage(
  from: CameraStage,
  to: CameraStage,
  progress: number,
  target: THREE.Camera
): void {
  const p = THREE.MathUtils.clamp(progress, 0, 1)
  const ease = p * p * (3 - 2 * p) // smoothstep

  // Interpolate position
  const pos = new THREE.Vector3().lerpVectors(from.camera.position, to.camera.position, ease)
  target.position.copy(pos)

  // Interpolate lookAt
  const look = new THREE.Vector3().lerpVectors(from.camera.lookAt, to.camera.lookAt, ease)
  target.lookAt(look)

  // Interpolate FOV
  if (target instanceof THREE.PerspectiveCamera && from.camera.fov && to.camera.fov) {
    target.fov = THREE.MathUtils.lerp(from.camera.fov, to.camera.fov, ease)
    target.updateProjectionMatrix()
  }
}
