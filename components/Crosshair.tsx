'use client'

import { useGameStore } from '../store/useGameStore'

export default function Crosshair() {
  const spread = useGameStore((s) => s.crosshairSpread)
  const gap = 4 + spread * 120
  const lineLen = 8
  const color = spread > 0.02 ? '#cc2200' : '#cc4444'

  return (
    <div style={{
      position: 'fixed', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
      width: 0, height: 0,
    }}>
      {/* center dot */}
      <div style={{
        position: 'absolute', width: 2, height: 2,
        background: color, borderRadius: '50%',
        top: -1, left: -1,
        boxShadow: `0 0 4px ${color}`,
      }} />
      {/* top */}
      <div style={{ position: 'absolute', width: 1, height: lineLen, background: color, left: 0, top: -(gap + lineLen), opacity: 0.9 }} />
      {/* bottom */}
      <div style={{ position: 'absolute', width: 1, height: lineLen, background: color, left: 0, top: gap, opacity: 0.9 }} />
      {/* left */}
      <div style={{ position: 'absolute', height: 1, width: lineLen, background: color, top: 0, left: -(gap + lineLen), opacity: 0.9 }} />
      {/* right */}
      <div style={{ position: 'absolute', height: 1, width: lineLen, background: color, top: 0, left: gap, opacity: 0.9 }} />
    </div>
  )
}
