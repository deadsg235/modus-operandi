'use client'

import { useFrame } from '@react-three/fiber'
import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { useGameStore } from '../store/useGameStore'

const ENEMY_SPEED = 3.2
const ATTACK_RANGE = 0.9
const ATTACK_DAMAGE = 6
const ATTACK_COOLDOWN = 1.4

type Props = {
  id: string
  startPos: THREE.Vector3
  playerPos: React.MutableRefObject<THREE.Vector3>
}

export default function Enemy({ id, startPos, playerPos }: Props) {
  const rootRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Group>(null)
  const hp = useRef(100)
  const attackTimer = useRef(ATTACK_COOLDOWN)
  const pendingDamage = useRef(0)
  const isDead = useRef(false)
  const [dead, setDead] = useState(false)
  const deathTimer = useRef(0)
  const [dying, setDying] = useState(false)

  useEffect(() => {
    if (!rootRef.current) return
    rootRef.current.userData.onHit = (isHead: boolean) => {
      if (isDead.current) return
      hp.current -= isHead ? 100 : 34
      if (hp.current <= 0) {
        isDead.current = true
        useGameStore.getState().addKill(isHead ? 'HEADSHOT' : 'KILL')
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
    const dir = playerPos.current.clone().sub(pos)
    dir.y = 0
    const dist = dir.length()

    if (dist > ATTACK_RANGE) {
      dir.normalize().multiplyScalar(ENEMY_SPEED * delta)
      pos.add(dir)
    }

    rootRef.current.lookAt(playerPos.current.x, pos.y, playerPos.current.z)

    if (bodyRef.current) {
      bodyRef.current.position.y = Math.sin(Date.now() * 0.012) * 0.04
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
        {/* torso */}
        <mesh name="body" position={[0, 0.3, 0]}>
          <boxGeometry args={[0.42, 0.5, 0.22]} />
          <meshStandardMaterial color="#1a0a0a" roughness={0.9} metalness={0.1} />
        </mesh>
        {/* head */}
        <mesh name="head" position={[0, 0.72, 0]}>
          <boxGeometry args={[0.28, 0.28, 0.28]} />
          <meshStandardMaterial color="#3d1a0a" roughness={0.85} />
        </mesh>
        {/* glowing eyes */}
        <mesh position={[-0.07, 0.76, 0.14]}>
          <sphereGeometry args={[0.035, 6, 6]} />
          <meshBasicMaterial color="#ff1100" />
        </mesh>
        <mesh position={[0.07, 0.76, 0.14]}>
          <sphereGeometry args={[0.035, 6, 6]} />
          <meshBasicMaterial color="#ff1100" />
        </mesh>
        <pointLight position={[0, 0.76, 0.2]} color="#ff1100" intensity={0.6} distance={1.5} decay={2} />
        {/* arms */}
        <mesh position={[-0.28, 0.22, 0]}>
          <boxGeometry args={[0.12, 0.44, 0.12]} />
          <meshStandardMaterial color="#1a0a0a" roughness={0.9} />
        </mesh>
        <mesh position={[0.28, 0.22, 0]}>
          <boxGeometry args={[0.12, 0.44, 0.12]} />
          <meshStandardMaterial color="#1a0a0a" roughness={0.9} />
        </mesh>
        {/* legs */}
        <mesh position={[-0.12, -0.18, 0]}>
          <boxGeometry args={[0.14, 0.38, 0.14]} />
          <meshStandardMaterial color="#1a0a0a" roughness={0.9} />
        </mesh>
        <mesh position={[0.12, -0.18, 0]}>
          <boxGeometry args={[0.14, 0.38, 0.14]} />
          <meshStandardMaterial color="#1a0a0a" roughness={0.9} />
        </mesh>
      </group>
    </group>
  )
}
