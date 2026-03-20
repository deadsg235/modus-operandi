'use client'

import Crosshair from './Crosshair'
import HitMarkers from './HitMarkers'
import DamageNumbers from './DamageNumbers'
import KillFeed from './Killfeed'

export default function HUD() {
  return (
    <>
      <Crosshair />
      <HitMarkers />
      <DamageNumbers />
      <KillFeed />
    </>
  )
}
