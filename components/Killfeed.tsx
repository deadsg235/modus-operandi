'use client'

import { useGameStore } from '../store/useGameStore'

export default function KillFeed() {
  const feed = useGameStore((s) => s.killFeed)

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        color: 'white',
        fontFamily: 'monospace',
      }}
    >
      {feed.map((k) => (
        <div key={k.id}>{k.text}</div>
      ))}
    </div>
  )
}