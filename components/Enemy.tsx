'use client'

import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'
import { useGameStore } from '../store/useGameStore'

const ENEMY_SPEED = 1.8
const ATTACK_RANGE = 1.2
const ATTACK_DAMAGE = 8
const ATTACK_COOLDOWN = 1.5

type Props = {
  id: string
  startPos: THREE.Vector3
  playerPos: React.MutableRefObject<THREE.Vector3>
  onDeath: (pos: THREE.Vector3) => void
}

export default function Enemy({ id, startPos, playerPos, onDeath }: Props) {
  const mesh = useRef<THREE.Mesh>(null)
  const hp = useRef(100)
  const attackTimer = useRef(ATTACK_COOLDOWN)
  const [dead, setDead] = useState(false)
  const takeDamage = useGameStore((s) => s.takeDamage)
  const addHitMarker = useGameStore((s) => s.addHitMarker)
  const addKill = useGameStore((s) => s.addKill)
  const registerHit = useGameStore((s) => s.registerHit)

  const handleHit = (isHead: boolean) => {
    if (dead) return
    const dmg = isHead ? 100 : 34
    hp.current -= dmg
    addHitMarker(isHead ? 'head' : 'body')
    registerHit(isHead ? 'head' : 'body')
    if (hp.current <= 0) {
      setDead(true)
      addKill(isHead ? '🎯 HEADSHOT' : '💀 KILL')
      onDeath(mesh.current!.position.clone())
    }
  }

  useFrame((_, delta) => {
    if (dead || !mesh.current) return
    const pos = mesh.current.position
    const dir = playerPos.current.clone().sub(pos)
    const dist = dir.length()
    if (dist > ATTACK_RANGE) {
      dir.normalize().multiplyScalar(ENEMY_SPEED * delta)
      pos.add(dir)
    }
    mesh.current.lookAt(playerPos.current.x, pos.y, playerPos.current.z)
    attackTimer.current -= delta
    if (dist <= ATTACK_RANGE && attackTimer.current <= 0) {
      takeDamage(ATTACK_DAMAGE)
      attackTimer.current = ATTACK_COOLDOWN
    }
  })

  if (dead) return null

  return (
    <group position={startPos} userData={{ enemyId: id, onHit: handleHit }}>
      <mesh ref={mesh} name="body">
        <boxGeometry args={[0.5, 0.8, 0.5]} />
        <meshStandardMaterial color="#cc2200" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.65, 0]} name="head">
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshStandardMaterial color="#dd3300" roughness={0.8} />
      </mesh>
    </group>
  )
}
