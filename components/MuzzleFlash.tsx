'use client'

import { useRef, forwardRef, useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export type MuzzleFlashHandle = { fire: () => void }

const MuzzleFlash = forwardRef<MuzzleFlashHandle>(function MuzzleFlash(_, ref) {
  const lightRef = useRef<THREE.PointLight>(null)
  const meshRef  = useRef<THREE.Mesh>(null)
  const intensity = useRef(0)

  useImperativeHandle(ref, () => ({
    fire() { intensity.current = 1 },
  }))

  useFrame((_, delta) => {
    intensity.current = Math.max(0, intensity.current - delta / 0.06)
    const v = intensity.current

    if (lightRef.current) lightRef.current.intensity = v * 6
    if (meshRef.current)  meshRef.current.visible = v > 0.05
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = v
    }
  })

  return (
    <group position={[0.18, -0.12, -0.35]}>
      <pointLight ref={lightRef} color="#ffaa33" intensity={0} distance={4} decay={2} />
      <mesh ref={meshRef} visible={false}>
        <planeGeometry args={[0.18, 0.18]} />
        <meshBasicMaterial color="#ffdd88" transparent opacity={1} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {/* inner core */}
      <mesh>
        <sphereGeometry args={[0.015, 6, 6]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  )
})

export default MuzzleFlash
