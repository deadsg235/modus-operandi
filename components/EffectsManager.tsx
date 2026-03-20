'use client'

import BloodFX from './BloodFX'
import { useGameStore } from '../store/useGameStore'

export default function EffectsManager() {
  const effects = useGameStore((s) => s.effects.slice(-40))
  return (
    <>
      {effects.map((e, i) =>
        e.type === 'blood'
          ? <BloodFX key={i} position={e.position} normal={e.normal} />
          : null
      )}
    </>
  )
}
