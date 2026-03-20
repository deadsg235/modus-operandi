'use client'

// Open battlefield — no outer walls, just scattered cover pillars
// Pillar positions on a loose grid with gaps for movement
export const PILLARS: [number, number][] = []

const GRID = 200
const SPACING = 12

for (let x = -GRID / 2; x <= GRID / 2; x += SPACING) {
  for (let z = -GRID / 2; z <= GRID / 2; z += SPACING) {
    // Skip center area so player has open space to start
    if (Math.abs(x) < 20 && Math.abs(z) < 20) continue
    // Random offset so it doesn't look like a perfect grid
    const ox = (Math.sin(x * 0.3 + z * 0.7) * 3)
    const oz = (Math.cos(x * 0.5 + z * 0.2) * 3)
    PILLARS.push([x + ox, z + oz])
  }
}

const WALL_COLORS = ['#c8a882', '#b89060', '#c09870', '#aa8050', '#d0b090']

export default function GameMap() {
  return (
    <group>
      {/* Massive floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#8a6a4a" roughness={1} metalness={0} />
      </mesh>

      {/* Scattered cover pillars */}
      {PILLARS.map(([x, z], i) => {
        const color = WALL_COLORS[i % WALL_COLORS.length]
        const height = 0.8 + (i % 3) * 0.4
        return (
          <mesh key={i} position={[x, height / 2, z]}>
            <boxGeometry args={[1.2, height, 1.2]} />
            <meshStandardMaterial color={color} roughness={0.9} metalness={0} />
          </mesh>
        )
      })}
    </group>
  )
}
