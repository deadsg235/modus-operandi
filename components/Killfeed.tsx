'use client'

import { useGameStore } from '../store/useGameStore'

export default function KillFeed() {
  const feed = useGameStore((s) => s.killFeed)

  return (
    <div style={{
      position: 'fixed', top: 20, right: 20,
      fontFamily: 'monospace', userSelect: 'none', pointerEvents: 'none',
      display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4,
    }}>
      {feed.map((k) => {
        const isHead = k.text.includes('HEADSHOT')
        return (
          <div key={k.id} style={{
            fontSize: 11,
            letterSpacing: 3,
            color: isHead ? '#ff2200' : '#882200',
            textShadow: isHead ? '0 0 10px #ff220088' : 'none',
            borderRight: `2px solid ${isHead ? '#ff2200' : '#440000'}`,
            paddingRight: 8,
            animation: 'killfade 3s forwards',
          }}>
            {isHead ? '▸ HEADSHOT' : '▸ KILL'}
          </div>
        )
      })}
    </div>
  )
}
