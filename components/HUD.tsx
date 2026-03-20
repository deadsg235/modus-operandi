'use client'

import Crosshair from './Crosshair'
import HitMarkers from './HitMarkers'
import DamageNumbers from './DamageNumbers'
import KillFeed from './Killfeed'
import { useGameStore } from '../store/useGameStore'

const WEAPON_LABELS: Record<string, string> = {
  AR: 'VX-9 AR',
  Shotgun: 'KITE SMG',
  Pistol: 'M-11',
}

export default function HUD() {
  const health = useGameStore((s) => s.health)
  const score = useGameStore((s) => s.score)
  const weapon = useGameStore((s) => s.currentWeapon)

  const hpColor = health > 50 ? '#cc2200' : health > 25 ? '#ff4400' : '#ff0000'
  const segments = 20
  const filledSegments = Math.round((health / 100) * segments)

  return (
    <>
      <Crosshair />
      <HitMarkers />
      <DamageNumbers />
      <KillFeed />

      {/* Bottom-left: health */}
      <div style={{
        position: 'fixed', bottom: 24, left: 24,
        fontFamily: 'monospace', userSelect: 'none', pointerEvents: 'none',
      }}>
        <div style={{ fontSize: 10, color: '#440000', letterSpacing: 3, marginBottom: 5 }}>
          VITALS
        </div>
        <div style={{ display: 'flex', gap: 2, marginBottom: 4 }}>
          {Array.from({ length: segments }).map((_, i) => (
            <div key={i} style={{
              width: 6, height: 14,
              background: i < filledSegments ? hpColor : '#1a0000',
              boxShadow: i < filledSegments ? `0 0 4px ${hpColor}88` : 'none',
              transition: 'background 0.1s',
            }} />
          ))}
        </div>
        <div style={{ fontSize: 11, color: hpColor, letterSpacing: 2, textShadow: `0 0 8px ${hpColor}` }}>
          {health} HP
        </div>
      </div>

      {/* Bottom-right: weapon + score */}
      <div style={{
        position: 'fixed', bottom: 24, right: 24,
        fontFamily: 'monospace', color: '#fff', userSelect: 'none', pointerEvents: 'none',
        textAlign: 'right',
      }}>
        <div style={{ fontSize: 10, color: '#440000', letterSpacing: 3, marginBottom: 4 }}>SCORE</div>
        <div style={{ fontSize: 22, color: '#cc2200', letterSpacing: 4, textShadow: '0 0 12px #ff000066' }}>
          {score}
        </div>
        <div style={{ marginTop: 10, fontSize: 10, color: '#550000', letterSpacing: 3 }}>
          {WEAPON_LABELS[weapon] ?? weapon}
        </div>
      </div>

      {/* Center-bottom hint */}
      <div style={{
        position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'monospace', color: '#2a0000', fontSize: 10, pointerEvents: 'none', letterSpacing: 2,
      }}>
        WASD · AIM · 1/2/3
      </div>
    </>
  )
}
