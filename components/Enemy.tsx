'use client'

import { useFrame } from '@react-three/fiber'
import { useRef, useState, useEffect } from 'react'
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
}

export default function Enemy({ id, startPos, playerPos }: Props) {
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const hp = useRef(100)
  const attackTimer = useRef(ATTACK_COOLDOWN)
  const pendingDamage = useRef(0)
  const isDead = useRef(false)
  const [dead, setDead] = useState(false)

  // Register hit handler on the group userData
  useEffect(() => {
    if (!groupRef.current) return
    groupRef.current.userData.onHit = (isHead: boolean) => {
      if (isDead.current) return
      hp.current -= isHead ? 100 : 34
      if (hp.current <= 0) {
        isDead.current = true
        const { addKill, addEffect } = useGameStore.getState()
        addKill(isHead ? '🎯 HEADSHOT' : '💀 KILL')
        if (meshRef.current) {
          addEffect({ type: 'blood', position: meshRef.current.position.clone(), intensity: 2 })
        }
        setDead(true)
      }
    }
  }, [])

  // Flush pending damage outside render loop
  useEffect(() => {
    const id = setInterval(() => {
      if (pendingDamage.current <= 0) return
      const dmg = pendingDamage.current
      pendingDamage.current = 0
      useGameStore.getState().takeDamage(dmg)
    }, 16)
    return () => clearInterval(id)
  }, [])

  useFrame((_, delta) => {
    if (dead || !meshRef.current) return
    const pos = meshRef.current.position
    const dir = playerPos.current.clone().sub(pos)
    const dist = dir.length()
    if (dist > ATTACK_RANGE) {
      dir.normalize().multiplyScalar(ENEMY_SPEED * delta)
      pos.add(dir)
    }
    meshRef.current.lookAt(playerPos.current.x, pos.y, playerPos.current.z)
    attackTimer.current -= delta
    if (dist <= ATTACK_RANGE && attackTimer.current <= 0) {
      pendingDamage.current += ATTACK_DAMAGE
      attackTimer.current = ATTACK_COOLDOWN
    }
  })

  if (dead) return null

  return (
    <group ref={groupRef} position={startPos}>
      <mesh ref={meshRef} name="body">
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
