'use client'

import { Decal } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'

export default function BloodDecal({
  position,
  normal,
}: {
  position: THREE.Vector3
  normal: THREE.Vector3
}) {
  const rotation = useMemo(() => {
    const euler = new THREE.Euler()
    euler.setFromVector3(normal)
    return euler
  }, [normal])

  const scale = 0.5 + Math.random() * 1.5

  return (
    <mesh>
      <Decal
        position={position}
        rotation={rotation}
        scale={scale}
      >
        <meshStandardMaterial
          color="#2a0000"
          roughness={1}
          transparent
          opacity={0.9}
        />
      </Decal>
    </mesh>
  )
}