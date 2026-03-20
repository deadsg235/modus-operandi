'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useGameStore } from '../store/useGameStore'
import { useState } from 'react'

export default function DamageNumbers() {
  const { camera } = useThree()
  const numbers = useGameStore((s) => s.damageNumbers)

  const [positions, setPositions] = useState<Record<number, { x: number; y: number }>>({})

  useFrame(() => {
    const newPos: Record<number, { x: number; y: number }> = {}

    numbers.forEach((n) => {
      const vector = n.position.clone()
      vector.project(camera)

      newPos[n.id] = {
        x: (vector.x * 0.5 + 0.5) * window.innerWidth,
        y: (-vector.y * 0.5 + 0.5) * window.innerHeight,
      }
    })

    setPositions(newPos)
  })

  return (
    <>
      {numbers.map((n) => {
        const pos = positions[n.id]
        if (!pos) return null

        return (
          <div
            key={n.id}
            style={{
              position: 'fixed',
              left: pos.x,
              top: pos.y,
              color: 'red',
              fontWeight: 'bold',
              pointerEvents: 'none',
              animation: 'floatUp 0.6s forwards',
            }}
          >
            {n.dmg}
          </div>
        )
      })}
    </>
  )
}