'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function BloodPool({ position }: { position: THREE.Vector3 }) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (ref.current && ref.current.scale.x < 2) {
      ref.current.scale.x += 0.01
      ref.current.scale.z += 0.01
    }
  })

  return (
    <mesh ref={ref} position={[position.x, position.y - 0.9, position.z]}>
      <circleGeometry args={[0.5, 32]} />
      <meshStandardMaterial
        color="#1a0000"
        roughness={1}
        transparent
        opacity={0.85}
      />
    </mesh>
  )
}