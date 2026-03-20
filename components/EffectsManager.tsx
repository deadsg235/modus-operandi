'use client'

import BloodDecal from './BloodFX'
import { useGameStore } from '../store/useGameStore'

export default function EffectsManager() {
  const effects = useGameStore((s) => s.effects)

  return (
    <>
      {effects.map((e, i) => {
        if (e.type === 'blood') {
          return <BloodDecal key={i} position={e.position} normal={e.normal} />
        }
      })}
    </>
  )
}
