'use client'

import { Decal } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'

const UP = new THREE.Vector3(0, 1, 0)

export default function BloodDecal({
  position,
  normal = UP,
}: {
  position: THREE.Vector3
  normal?: THREE.Vector3
}) {
  const rotation = useMemo(() => {
    const q = new THREE.Quaternion().setFromUnitVectors(UP, normal.clone().normalize())
    return new THREE.Euler().setFromQuaternion(q)
  }, [normal])

  const scale = useMemo(() => 0.5 + Math.random() * 1.5, [])

  return (
    <mesh>
      <Decal position={position} rotation={rotation} scale={scale}>
        <meshStandardMaterial color="#2a0000" roughness={1} transparent opacity={0.9} polygonOffset polygonOffsetFactor={-10} />
      </Decal>
    </mesh>
  )
}
