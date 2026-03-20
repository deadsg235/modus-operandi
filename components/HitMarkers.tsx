'use client'

import { useEffect } from 'react'
import { useGameStore } from '../store/useGameStore'

export default function HitMarkers() {
  const markers = useGameStore((s) => s.hitMarkers)

  // Auto-remove each marker after its animation completes
  useEffect(() => {
    if (!markers.length) return
    const id = setTimeout(() => {
      useGameStore.setState((s) => ({ hitMarkers: s.hitMarkers.slice(1) }))
    }, 300)
    return () => clearTimeout(id)
  }, [markers])

  return (
    <>
      {markers.map((m) => (
        <div
          key={m.id}
          style={{
            position: 'fixed',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            color: m.type === 'head' ? '#ff3333' : 'white',
            fontSize: 24,
            pointerEvents: 'none',
            animation: 'hitfade 0.3s forwards',
          }}
        >
          ✖
        </div>
      ))}
    </>
  )
}
