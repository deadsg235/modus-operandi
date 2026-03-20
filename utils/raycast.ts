export type Vec2 = { x: number; y: number }

export type RayHit = {
  distance: number
  wallSide: 'ns' | 'ew'
  mapX: number
  mapY: number
  wallX: number // exact hit position on wall face (0-1), used for texturing
}

export type SpriteHit = {
  id: string
  distance: number
  type: 'enemy' | 'player'
  isHead: boolean // true if ray hits upper 25% of sprite — headshot zone
}

export type CastResult = {
  wall: RayHit
  sprites: SpriteHit[]
}

// DDA raycast against tile map, returns first wall hit
export function castRay(
  origin: Vec2,
  angle: number,
  map: number[][],
): RayHit {
  const dir = { x: Math.cos(angle), y: Math.sin(angle) }

  let mapX = Math.floor(origin.x)
  let mapY = Math.floor(origin.y)

  const deltaDist = {
    x: Math.abs(1 / dir.x),
    y: Math.abs(1 / dir.y),
  }

  const step = { x: 0, y: 0 }
  let sideDist = { x: 0, y: 0 }

  if (dir.x < 0) {
    step.x = -1
    sideDist.x = (origin.x - mapX) * deltaDist.x
  } else {
    step.x = 1
    sideDist.x = (mapX + 1 - origin.x) * deltaDist.x
  }

  if (dir.y < 0) {
    step.y = -1
    sideDist.y = (origin.y - mapY) * deltaDist.y
  } else {
    step.y = 1
    sideDist.y = (mapY + 1 - origin.y) * deltaDist.y
  }

  let wallSide: 'ns' | 'ew' = 'ns'

  while (true) {
    if (sideDist.x < sideDist.y) {
      sideDist.x += deltaDist.x
      mapX += step.x
      wallSide = 'ew'
    } else {
      sideDist.y += deltaDist.y
      mapY += step.y
      wallSide = 'ns'
    }

    if (map[mapY]?.[mapX] > 0) break
  }

  const distance =
    wallSide === 'ew'
      ? (mapX - origin.x + (1 - step.x) / 2) / dir.x
      : (mapY - origin.y + (1 - step.y) / 2) / dir.y

  const wallX =
    wallSide === 'ew'
      ? origin.y + distance * dir.y - Math.floor(origin.y + distance * dir.y)
      : origin.x + distance * dir.x - Math.floor(origin.x + distance * dir.x)

  return { distance, wallSide, mapX, mapY, wallX }
}

// Check if a ray hits a sprite (enemy or player) before the wall
export function castSprites(
  origin: Vec2,
  angle: number,
  wallDist: number,
  sprites: { id: string; position: Vec2; type: 'enemy' | 'player' }[],
): SpriteHit[] {
  const dir = { x: Math.cos(angle), y: Math.sin(angle) }
  const hits: SpriteHit[] = []

  for (const sprite of sprites) {
    const dx = sprite.position.x - origin.x
    const dy = sprite.position.y - origin.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance >= wallDist) continue

    // Angle between ray and sprite direction
    const spriteAngle = Math.atan2(dy, dx)
    const angleDiff = Math.abs(normalizeAngle(spriteAngle - angle))

    // Sprite half-width in angle space (approx 0.3 units wide at any distance)
    const halfWidth = Math.atan2(0.3, distance)
    if (angleDiff > halfWidth) continue

    // Dot product check — sprite must be in front
    if (dx * dir.x + dy * dir.y <= 0) continue

    // Vertical hit position: 0 = feet, 1 = head (sprite fills full column height)
    // Ray hits "head" if it's in the top 25% of the sprite
    const verticalHit = 0.5 // center hit by default; override with screen-y in renderer
    const isHead = verticalHit > 0.75

    hits.push({ id: sprite.id, distance, type: sprite.type, isHead })
  }

  return hits.sort((a, b) => a.distance - b.distance)
}

function normalizeAngle(a: number): number {
  while (a > Math.PI) a -= 2 * Math.PI
  while (a < -Math.PI) a += 2 * Math.PI
  return a
}

// Full cast for one screen column
export function castColumn(
  origin: Vec2,
  angle: number,
  map: number[][],
  sprites: { id: string; position: Vec2; type: 'enemy' | 'player' }[],
): CastResult {
  const wall = castRay(origin, angle, map)
  const spriteHits = castSprites(origin, angle, wall.distance, sprites)
  return { wall, sprites: spriteHits }
}
