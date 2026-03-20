'use client'

import Crosshair from './Crosshair'
import HitMarkers from './HitMarkers'
import DamageNumbers from './DamageNumbers'
import KillFeed from './Killfeed'
import { useGameStore } from '../store/useGameStore'

export default function HUD() {
  const health = useGameStore((s) => s.health)
  const score = useGameStore((s) => s.score)
  const weapon = useGameStore((s) => s.currentWeapon)

  return (
    <>
      <Crosshair />
      <HitMarkers />
      <DamageNumbers />
      <KillFeed />
      {/* Bottom bar */}
      <div style={{
        position: 'fixed', bottom: 20, left: 20,
        fontFamily: 'monospace', color: '#fff', userSelect: 'none', pointerEvents: 'none',
      }}>
        <div style={{ marginBottom: 6, fontSize: 13, color: '#aaa' }}>{weapon}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: '#f55' }}>HP</span>
          <div style={{ width: 120, height: 8, background: '#333', borderRadius: 4 }}>
            <div style={{
              width: `${health}%`, height: '100%',
              background: health > 50 ? '#44ff44' : health > 25 ? '#ffaa00' : '#ff2222',
              borderRadius: 4, transition: 'width 0.2s',
            }} />
          </div>
          <span style={{ fontSize: 13 }}>{health}</span>
        </div>
      </div>
      <div style={{
        position: 'fixed', bottom: 20, right: 20,
        fontFamily: 'monospace', color: '#fff', fontSize: 16, userSelect: 'none', pointerEvents: 'none',
      }}>
        SCORE: {score}
      </div>
      <div style={{
        position: 'fixed', bottom: 48, left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'monospace', color: '#888', fontSize: 11, pointerEvents: 'none',
      }}>
        CLICK TO AIM · WASD MOVE · 1/2/3 WEAPON
      </div>
    </>
  )
}
