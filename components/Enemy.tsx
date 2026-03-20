'use client'

import { useFrame } from '@react-three/fiber'
import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { useGameStore } from '../store/useGameStore'

const ATTACK_RANGE = 0.9
const ATTACK_DAMAGE = 6
const ATTACK_COOLDOWN = 1.4

type BehaviorType = 'charger' | 'flanker' | 'stalker' | 'berserker'

const BEHAVIOR_CONFIGS: Record<BehaviorType, { speed: number; torso: string; eye: string }> = {
  charger:   { speed: 3.2, torso: '#2a0a0a', eye: '#ff1100' },
  flanker:   { speed: 2.8, torso: '#0a0a2a', eye: '#4488ff' },
  stalker:   { speed: 2.4, torso: '#0a2a0a', eye: '#44ff44' },
  berserker: { speed: 4.0, torso: '#2a1008', eye: '#ff8800' },
}

const BEHAVIORS: BehaviorType[] = ['charger', 'flanker', 'stalker', 'berserker']

type Props = {
  id: string
  index: number
  startPos: THREE.Vector3
  playerPos: React.MutableRefObject<THREE.Vector3>
}

export default function Enemy({ index, startPos, playerPos }: Props) {
  const behavior: BehaviorType = BEHAVIORS[index % BEHAVIORS.length]
  const cfg = BEHAVIOR_CONFIGS[behavior]

  const rootRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Group>(null)
  const hp = useRef(100)
  const attackTimer = useRef(ATTACK_COOLDOWN)
  const pendingDamage = useRef(0)
  const isDead = useRef(false)
  const [dead, setDead] = useState(false)
  const deathTimer = useRef(0)
  const [dying, setDying] = useState(false)

  const flankAngle = useRef(Math.random() * Math.PI * 2)
  const stalkerState = useRef<'approach' | 'retreat'>('approach')
  const stalkerTimer = useRef(1.0)
  const zigzag = useRef(1)
  const zigzagTimer = useRef(0)

  // Patrol: wander point when player is far
  const wanderTarget = useRef(startPos.clone())
  const wanderTimer = useRef(0)

  useEffect(() => {
    if (!rootRef.current) return
    rootRef.current.userData.onHit = (isHead: boolean) => {
      if (isDead.current) return
      hp.current -= isHead ? 100 : 34
      if (hp.current <= 0) {
        isDead.current = true
        useGameStore.getState().addKill(isHead ? 'HEADSHOT' : 'KILL')
        useGameStore.getState().reportEnemyDeath()
        setDying(true)
      }
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (pendingDamage.current <= 0) return
      const dmg = pendingDamage.current
      pendingDamage.current = 0
      useGameStore.getState().takeDamage(dmg)
    }, 16)
    return () => clearInterval(interval)
  }, [])

  useFrame((_, delta) => {
    if (dead || !rootRef.current) return

    if (dying) {
      deathTimer.current += delta
      rootRef.current.rotation.x = Math.min(Math.PI / 2, deathTimer.current * 6)
      rootRef.current.position.y = Math.max(-0.5, startPos.y - deathTimer.current * 2)
      if (deathTimer.current > 0.5) setDead(true)
      return
    }

    const pos = rootRef.current.position
    const toPlayer = playerPos.current.clone().sub(pos)
    toPlayer.y = 0
    const dist = toPlayer.length()
    const dirNorm = toPlayer.clone().normalize()

    const ENGAGE_DIST = 30
    let move = new THREE.Vector3()

    if (dist > ENGAGE_DIST) {
      // Patrol: wander slowly near spawn
      wanderTimer.current -= delta
      if (wanderTimer.current <= 0) {
        const angle = Math.random() * Math.PI * 2
        wanderTarget.current.set(
          startPos.x + Math.cos(angle) * 8,
          0.5,
          startPos.z + Math.sin(angle) * 8,
        )
        wanderTimer.current = 3 + Math.random() * 3
      }
      const toWander = wanderTarget.current.clone().sub(pos)
      toWander.y = 0
      if (toWander.length() > 0.5) {
        move = toWander.normalize().multiplyScalar(1.2 * delta)
      }
    } else {
      // Engage
      if (behavior === 'charger') {
        if (dist > ATTACK_RANGE) move = dirNorm.clone().multiplyScalar(cfg.speed * delta)

      } else if (behavior === 'flanker') {
        flankAngle.current += delta * 1.2
        const orbitR = Math.max(ATTACK_RANGE + 0.5, dist * 0.85)
        const tx = playerPos.current.x + Math.cos(flankAngle.current) * orbitR
        const tz = playerPos.current.z + Math.sin(flankAngle.current) * orbitR
        const toT = new THREE.Vector3(tx - pos.x, 0, tz - pos.z)
        if (toT.length() > 0.05) move = toT.normalize().multiplyScalar(cfg.speed * delta)

      } else if (behavior === 'stalker') {
        stalkerTimer.current -= delta
        const midRange = 6
        if (stalkerState.current === 'approach') {
          if (dist > midRange) {
            move = dirNorm.clone().multiplyScalar(cfg.speed * delta)
          } else if (stalkerTimer.current <= 0) {
            if (dist > ATTACK_RANGE) move = dirNorm.clone().multiplyScalar(cfg.speed * 2 * delta)
            if (dist <= ATTACK_RANGE + 0.3) {
              stalkerState.current = 'retreat'
              stalkerTimer.current = 1.5
            }
          }
        } else {
          move = dirNorm.clone().multiplyScalar(-cfg.speed * delta)
          if (stalkerTimer.current <= 0) {
            stalkerState.current = 'approach'
            stalkerTimer.current = 1.0 + Math.random() * 1.0
          }
        }

      } else if (behavior === 'berserker') {
        zigzagTimer.current -= delta
        if (zigzagTimer.current <= 0) {
          zigzag.current *= -1
          zigzagTimer.current = 0.3 + Math.random() * 0.25
        }
        const perp = new THREE.Vector3(-dirNorm.z, 0, dirNorm.x).multiplyScalar(zigzag.current * 0.7)
        if (dist > ATTACK_RANGE) move = dirNorm.clone().add(perp).normalize().multiplyScalar(cfg.speed * delta)
      }
    }

    pos.add(move)
    rootRef.current.lookAt(playerPos.current.x, pos.y, playerPos.current.z)

    if (bodyRef.current) {
      const speed = move.length() / delta
      bodyRef.current.position.y = speed > 0.5 ? Math.sin(Date.now() * 0.016) * 0.06 : 0
    }

    attackTimer.current -= delta
    if (dist <= ATTACK_RANGE && attackTimer.current <= 0) {
      pendingDamage.current += ATTACK_DAMAGE
      attackTimer.current = ATTACK_COOLDOWN
    }
  })

  if (dead) return null

  return (
    <group ref={rootRef} position={startPos}>
      <group ref={bodyRef}>
        <mesh name="body" position={[0, 0.3, 0]}>
          <boxGeometry args={[0.42, 0.5, 0.22]} />
          <meshStandardMaterial color={cfg.torso} roughness={0.9} metalness={0.15} />
        </mesh>
        <mesh name="head" position={[0, 0.72, 0]}>
          <boxGeometry args={[0.28, 0.28, 0.28]} />
          <meshStandardMaterial color={cfg.torso} roughness={0.85} />
        </mesh>
        <mesh position={[-0.07, 0.76, 0.14]}>
          <sphereGeometry args={[0.035, 6, 6]} />
          <meshBasicMaterial color={cfg.eye} />
        </mesh>
        <mesh position={[0.07, 0.76, 0.14]}>
          <sphereGeometry args={[0.035, 6, 6]} />
          <meshBasicMaterial color={cfg.eye} />
        </mesh>
        <pointLight position={[0, 0.76, 0.2]} color={cfg.eye} intensity={0.8} distance={2} decay={2} />
        <mesh position={[-0.28, 0.22, 0]}>
          <boxGeometry args={[0.12, 0.44, 0.12]} />
          <meshStandardMaterial color={cfg.torso} roughness={0.9} />
        </mesh>
        <mesh position={[0.28, 0.22, 0]}>
          <boxGeometry args={[0.12, 0.44, 0.12]} />
          <meshStandardMaterial color={cfg.torso} roughness={0.9} />
        </mesh>
        <mesh position={[-0.12, -0.18, 0]}>
          <boxGeometry args={[0.14, 0.38, 0.14]} />
          <meshStandardMaterial color={cfg.torso} roughness={0.9} />
        </mesh>
        <mesh position={[0.12, -0.18, 0]}>
          <boxGeometry args={[0.14, 0.38, 0.14]} />
          <meshStandardMaterial color={cfg.torso} roughness={0.9} />
        </mesh>
      </group>
    </group>
  )
}
