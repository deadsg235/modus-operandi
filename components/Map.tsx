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

const WALL_COLOR = '#555'
const FLOOR_COLOR = '#222'
const CEIL_COLOR  = '#111'

export default function GameMap() {
  const walls: JSX.Element[] = []

  for (let row = 0; row < MAP.length; row++) {
    for (let col = 0; col < MAP[row].length; col++) {
      if (MAP[row][col] === 1) {
        walls.push(
          <mesh key={`${row}-${col}`} position={[col + 0.5, 0.5, row + 0.5]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshLambertMaterial color={WALL_COLOR} />
          </mesh>
        )
      }
    }
  }

  const W = MAP[0].length
  const H = MAP.length

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[W / 2, 0, H / 2]}>
        <planeGeometry args={[W, H]} />
        <meshLambertMaterial color={FLOOR_COLOR} />
      </mesh>
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[W / 2, 1, H / 2]}>
        <planeGeometry args={[W, H]} />
        <meshLambertMaterial color={CEIL_COLOR} />
      </mesh>
      {walls}
    </group>
  )
}
