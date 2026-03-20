'use client'

export const MAP: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,0,0,0,0,0,0,1,1,0,0,1],
  [1,0,1,0,0,0,0,0,0,0,0,0,1,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,1,1,1,1,0,0,0,0,0,0,1],
  [1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
  [1,0,0,0,0,1,1,1,1,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,0,0,0,0,0,0,0,0,0,1,0,0,1],
  [1,0,1,1,0,0,0,0,0,0,0,1,1,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
]

// Subtle wall color variation for grit
const WALL_COLORS = ['#1c1410', '#181210', '#1a1310', '#161010', '#1e1512']

export default function GameMap() {
  const walls: JSX.Element[] = []

  for (let row = 0; row < MAP.length; row++) {
    for (let col = 0; col < MAP[row].length; col++) {
      if (MAP[row][col] === 1) {
        const color = WALL_COLORS[(row * 3 + col * 7) % WALL_COLORS.length]
        walls.push(
          <mesh key={`${row}-${col}`} position={[col + 0.5, 0.5, row + 0.5]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshLambertMaterial color={color} />
          </mesh>
        )
      }
    }
  }

  const W = MAP[0].length
  const H = MAP.length

  return (
    <group>
      {/* Floor — dark cracked concrete */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[W / 2, 0, H / 2]}>
        <planeGeometry args={[W, H]} />
        <meshLambertMaterial color="#0e0b09" />
      </mesh>
      {/* Ceiling — near black */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[W / 2, 1, H / 2]}>
        <planeGeometry args={[W, H]} />
        <meshLambertMaterial color="#080608" />
      </mesh>
      {walls}
    </group>
  )
}
