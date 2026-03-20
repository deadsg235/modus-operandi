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

const WALL_COLORS = ['#4a3828', '#3e2e1e', '#453322', '#3a2a18', '#503c2a']

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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[W / 2, 0, H / 2]}>
        <planeGeometry args={[W, H]} />
        <meshLambertMaterial color="#2a1e14" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[W / 2, 1, H / 2]}>
        <planeGeometry args={[W, H]} />
        <meshLambertMaterial color="#1a1210" />
      </mesh>
      {walls}
    </group>
  )
}
