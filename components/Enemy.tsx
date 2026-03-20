'use client'

import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'
import { useGameStore } from '../store/useGameStore'

const ENEMY_SPEED = 1.5
const ATTACK_RANGE = 1.2
const ATTACK_DAMAGE = 10
const ATTACK_COOLDOWN = 1.2

type Props = {
  id: string
  startPos: THREE.Vector3
  playerPos: React.MutableRefObject<THREE.Vector3>
  onDeath: (pos: THREE.Vector3) => void
}

export default function Enemy({ id, startPos, playerPos, onDeath }: Props) {
  const mesh = useRef<THREE.Mesh>(null)
  const hp = useRef(100)
  const attackTimer = useRef(0)
  const [dead, setDead] = useState(false)
  const takeDamage = useGameStore((s) => s.takeDamage)
  const registerHit = useGameStore((s) => s.registerHit)

  // Expose hit method via mesh userData
  const handleHit = (isHead: boolean) => {
    if (dead) return
    const dmg = isHead ? 100 : 34
    hp.current -= dmg
    registerHit(isHead ? 'head' : 'body')
    if (hp.current <= 0) {
      setDead(true)
      onDeath(mesh.current!.position.clone())
    }
  }

  useFrame((_, delta) => {
    if (dead || !mesh.current) return

    const pos = mesh.current.position
    const dir = playerPos.current.clone().sub(pos)
    const dist = dir.length()

    // Chase player
    if (dist > ATTACK_RANGE) {
      dir.normalize().multiplyScalar(ENEMY_SPEED * delta)
      pos.add(dir)
    }

    // Face player
    mesh.current.lookAt(playerPos.current.x, pos.y, playerPos.current.z)

    // Attack
    attackTimer.current -= delta
    if (dist <= ATTACK_RANGE && attackTimer.current <= 0) {
      takeDamage(ATTACK_DAMAGE)
      attackTimer.current = ATTACK_COOLDOWN
    }
  })

  if (dead) return null

  return (
    <mesh
      ref={mesh}
      position={startPos}
      userData={{ enemyId: id, onHit: handleHit }}
    >
      {/* Body */}
      <boxGeometry args={[0.5, 0.8, 0.5]} />
      <meshStandardMaterial color="#3a0000" roughness={1} metalness={0} />
      {/* Head hitbox indicator */}
      <mesh position={[0, 0.65, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#3a0000" roughness={1} metalness={0} />
      </mesh>
    </mesh>
  )
}
