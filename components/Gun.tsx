'use client'

import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

export default function Gun() {
  const ref = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!ref.current) return

    // idle sway
    ref.current.rotation.y = Math.sin(Date.now() * 0.002) * 0.02
    ref.current.rotation.x = Math.sin(Date.now() * 0.003) * 0.01
  })

  return (
    <group ref={ref} position={[0.3, -0.3, -0.5]}>
      {/* Body */}
      <mesh>
        <boxGeometry args={[0.4, 0.2, 1]} />
        <meshStandardMaterial color="black" metalness={0.8} />
      </mesh>

      {/* Barrel */}
      <mesh position={[0, 0, -0.7]}>
        <cylinderGeometry args={[0.05, 0.05, 0.6]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </group>
  )
}