'use client'

import { useGameStore } from '../store/useGameStore'

export default function DamageNumbers() {
  const numbers = useGameStore((s) => s.damageNumbers)
  const positions = useGameStore((s) => s.damagePositions)

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
              fontFamily: 'monospace',
              fontSize: 18,
            }}
          >
            {n.dmg}
          </div>
        )
      })}
    </>
  )
}
