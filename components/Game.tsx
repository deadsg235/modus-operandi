'use client'

import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { useRef, useCallback, useEffect } from 'react'
import * as THREE from 'three'
import GameMap from './Map'
import Player from './Player'
import Enemy from './Enemy'
import HUD from './HUD'
import EffectsManager from './EffectsManager'
import DecalManager from './DecalManager'
import MuzzleFlash, { type MuzzleFlashHandle } from './MuzzleFlash'
import { useGameStore } from '../store/useGameStore'
import { useWeapon } from './useweapon'

function DamageProjector() {
  const { camera } = useThree()
  const numbers = useGameStore((s) => s.damageNumbers)
  const setDamagePositions = useGameStore((s) => s.setDamagePositions)
  useFrame(() => {
    if (!numbers.length) return
    const newPos: Record<number, { x: number; y: number }> = {}
    numbers.forEach((n) => {
      const v = n.position.clone().project(camera)
      newPos[n.id] = {
        x: (v.x * 0.5 + 0.5) * window.innerWidth,
        y: (-v.y * 0.5 + 0.5) * window.innerHeight,
      }
    })
    setDamagePositions(newPos)
  })
  return null
}

const ENEMY_STARTS = [
  new THREE.Vector3(3.5, 0.5, 3.5),
  new THREE.Vector3(12.5, 0.5, 3.5),
  new THREE.Vector3(7.5, 0.5, 7.5),
  new THREE.Vector3(3.5, 0.5, 12.5),
  new THREE.Vector3(12.5, 0.5, 12.5),
]

const TORCH_POSITIONS: [number, number, number][] = [
  [3.5, 2.5, 3.5],
  [12.5, 2.5, 3.5],
  [7.5, 2.5, 7.5],
  [3.5, 2.5, 12.5],
  [12.5, 2.5, 12.5],
]

function FlickerLight({ position }: { position: [number, number, number] }) {
  const light = useRef<THREE.PointLight>(null)
  const offset = useRef(Math.random() * 100)
  useFrame(({ clock }) => {
    if (!light.current) return
    const t = clock.elapsedTime + offset.current
    light.current.intensity = 1.4 + Math.sin(t * 7) * 0.2 + Math.sin(t * 13) * 0.1
  })
  return <pointLight ref={light} position={position} intensity={1.5} distance={14} color="#ffbb66" decay={2} />
}

function Scene() {
  const { camera, scene, gl } = useThree()
  const playerPos = useRef(new THREE.Vector3(1.5, 0.5, 1.5))
  const addEffect = useGameStore((s) => s.addEffect)
  const registerHit = useGameStore((s) => s.registerHit)
  const spawnDecal = useGameStore((s) => s.spawnDecal)
  const currentWeapon = useGameStore((s) => s.currentWeapon)
  const phase = useGameStore((s) => s.phase)
  const { weapon, canShoot, lastShot } = useWeapon(currentWeapon)
  const flashRef = useRef<MuzzleFlashHandle>(null)
  const flashGroup = useRef<THREE.Group>(null)
  const flashAdded = useRef(false)
  const isMouseDown = useRef(false)
  const firedThisPress = useRef(false)

  useEffect(() => {
    if (flashGroup.current && !flashAdded.current) {
      camera.add(flashGroup.current)
      flashAdded.current = true
    }
  }, [camera])

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (e.button === 0) { isMouseDown.current = true; firedThisPress.current = false }
    }
    const onUp = (e: MouseEvent) => {
      if (e.button === 0) { isMouseDown.current = false; firedThisPress.current = false }
    }
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  const shoot = useCallback(() => {
    flashRef.current?.fire()
    const dir = new THREE.Vector3()
    camera.getWorldDirection(dir)
    dir.x += (Math.random() - 0.5) * weapon.spread
    dir.y += (Math.random() - 0.5) * weapon.spread
    const ray = new THREE.Raycaster(camera.position.clone(), dir.normalize())
    const hits = ray.intersectObjects(scene.children, true)
    if (hits.length > 0) {
      const hit = hits[0]
      const isHead = hit.object.name === 'head'
      registerHit(isHead ? 'head' : 'body')
      addEffect({ type: 'blood', position: hit.point.clone(), normal: hit.face?.normal.clone(), intensity: isHead ? weapon.headshotMultiplier : 1 })
      spawnDecal({ position: hit.point.clone(), normal: hit.face?.normal.clone() ?? new THREE.Vector3(0, 1, 0) })
      let obj: THREE.Object3D | null = hit.object
      while (obj) {
        if (obj.userData?.onHit) { obj.userData.onHit(isHead); break }
        obj = obj.parent
      }
    }
  }, [camera, scene, weapon, registerHit, addEffect, spawnDecal])

  useFrame(() => {
    // Keep playerPos in sync for enemies
    playerPos.current.copy(camera.position)

    if (phase !== 'playing' || !document.pointerLockElement) return
    const time = performance.now() / 1000
    if (!isMouseDown.current) return
    if (!weapon.automatic && firedThisPress.current) return
    if (!canShoot(time)) return
    lastShot.current = time
    firedThisPress.current = true
    shoot()
  })

  const handleDeath = useCallback((pos: THREE.Vector3) => {
    addEffect({ type: 'blood', position: pos, intensity: 1.5 })
  }, [addEffect])

  return (
    <>
      <ambientLight intensity={0.5} />
      <fog attach="fog" args={['#000000', 12, 30]} />
      {TORCH_POSITIONS.map((pos, i) => <FlickerLight key={i} position={pos} />)}
      <GameMap />
      {ENEMY_STARTS.map((pos, i) => (
        <Enemy
          key={i}
          id={`enemy-${i}`}
          startPos={pos}
          playerPos={playerPos}
          onDeath={handleDeath}
        />
      ))}
      <Player />
      <EffectsManager />
      <DecalManager />
      <DamageProjector />
      <group ref={flashGroup}>
        <MuzzleFlash ref={flashRef} />
      </group>
    </>
  )
}

function Overlay() {
  const phase = useGameStore((s) => s.phase)
  const score = useGameStore((s) => s.score)
  if (phase === 'playing') return null
  const isDead = phase === 'dead'
  return (
    <div style={overlayStyle}>
      <h1 style={{ color: isDead ? '#cc2222' : '#ff2222', fontSize: 48, margin: 0, letterSpacing: 4 }}>
        {isDead ? 'YOU DIED' : 'MODUS OPERANDI'}
      </h1>
      {isDead && <p style={{ color: '#aaa', margin: '8px 0 24px', fontSize: 22 }}>Score: {score}</p>}
      <button
        style={btnStyle}
        onClick={() => useGameStore.setState({ health: 100, score: 0, phase: 'playing' })}
      >
        {isDead ? 'RESPAWN' : 'PLAY'}
      </button>
    </div>
  )
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0,
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(0,0,0,0.88)',
  fontFamily: 'monospace',
  zIndex: 10,
}

const btnStyle: React.CSSProperties = {
  marginTop: 20, padding: '12px 40px',
  background: '#cc0000', color: '#fff',
  border: 'none', fontSize: 20,
  cursor: 'pointer', letterSpacing: 3,
  fontFamily: 'monospace',
}

export default function Game() {
  return (
    <>
      <Canvas
        camera={{ fov: 75, near: 0.05, far: 30, position: [1.5, 0.5, 1.5] }}
        style={{ width: '100vw', height: '100vh', background: '#000' }}
      >
        <Scene />
      </Canvas>
      <HUD />
      <Overlay />
    </>
  )
}
