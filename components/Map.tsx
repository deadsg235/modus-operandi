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

const WALL_COLORS = ['#c8a882', '#b89060', '#c09870', '#aa8050', '#d0b090']

export default function GameMap() {
  const walls: JSX.Element[] = []

  for (let row = 0; row < MAP.length; row++) {
    for (let col = 0; col < MAP[row].length; col++) {
      if (MAP[row][col] === 1) {
        const color = WALL_COLORS[(row * 3 + col * 7) % WALL_COLORS.length]
        walls.push(
          <mesh key={`${row}-${col}`} position={[col + 0.5, 0.5, row + 0.5]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={color} roughness={0.9} metalness={0} />
          </mesh>
        )
      }
    }
  }

  const W = MAP[0].length
  const H = MAP.length

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[W / 2, 0, H / 2]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color="#8a6a4a" roughness={1} metalness={0} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[W / 2, 1, H / 2]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color="#6a5040" roughness={1} metalness={0} />
      </mesh>
      {walls}
    </group>
  )
}
