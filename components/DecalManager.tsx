'use client'

import { useGameStore } from '../store/useGameStore'
import BloodDecal from './BloodDecal'

export default function DecalManager() {
  const decals = useGameStore((s) => s.decals)

  return (
    <>
      {decals.map((d, i) => (
        <BloodDecal
          key={i}
          position={d.position}
          normal={d.normal}
        />
      ))}
    </>
  )
}