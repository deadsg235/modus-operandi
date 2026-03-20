'use client'

import { useGameStore } from '../store/useGameStore'

export default function Crosshair() {
  const spread = useGameStore((s) => s.crosshairSpread)
  const size = 10 + spread * 200

  return (
    <div style={{
      position: 'fixed',
      top: '50%', left: '50%',
      width: size, height: size,
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
    }}>
      <div style={line(size, 'top')} />
      <div style={line(size, 'bottom')} />
      <div style={line(size, 'left')} />
      <div style={line(size, 'right')} />
    </div>
  )
}

function line(size: number, dir: 'top' | 'bottom' | 'left' | 'right'): React.CSSProperties {
  const base: React.CSSProperties = { position: 'absolute', background: 'white', opacity: 0.85 }
  switch (dir) {
    case 'top':    return { ...base, width: 2, height: size / 2, left: '50%', top: 0 }
    case 'bottom': return { ...base, width: 2, height: size / 2, left: '50%', bottom: 0 }
    case 'left':   return { ...base, height: 2, width: size / 2, top: '50%', left: 0 }
    case 'right':  return { ...base, height: 2, width: size / 2, top: '50%', right: 0 }
  }
}
