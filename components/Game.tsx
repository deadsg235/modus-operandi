'use client'

import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { useRef, useCallback, useEffect } from 'react'
import * as THREE from 'three'
import GameMap from './Map'
import Player from './Player'
import Enemy from './Enemy'
import HUD from './HUD'
import EffectsManager from './EffectsManager'
import MuzzleFlash, { type MuzzleFlashHandle } from './MuzzleFlash'
import { useGameStore } from '../store/useGameStore'
import { useWeapon } from './useweapon'

const ENEMY_STARTS = [
  new THREE.Vector3(3.5, 0.5, 3.5),
  new THREE.Vector3(12.5, 0.5, 3.5),
  new THREE.Vector3(7.5, 0.5, 7.5),
  new THREE.Vector3(3.5, 0.5, 12.5),
  new THREE.Vector3(12.5, 0.5, 12.5),
]

const TORCH_POSITIONS: [number, number, number][] = [
  [3.5, 0.85, 3.5],
  [12.5, 0.85, 3.5],
  [7.5, 0.85, 7.5],
  [3.5, 0.85, 12.5],
  [12.5, 0.85, 12.5],
]

function FlickerLight({ position }: { position: [number, number, number] }) {
  const light = useRef<THREE.PointLight>(null)
  const offset = useRef(Math.random() * 100)
  useFrame(({ clock }) => {
    if (!light.current) return
    const t = clock.elapsedTime + offset.current
    light.current.intensity = 0.8 + Math.sin(t * 7) * 0.15 + Math.sin(t * 13) * 0.05
  })
  return <pointLight ref={light} position={position} intensity={0.9} distance={6} color="#ff9944" decay={2} />
}

// Separate inner component so hooks (useThree, useFrame) run inside Canvas context
function Scene() {
  const { camera, scene, gl } = useThree()
  const playerPos = useRef(new THREE.Vector3(1.5, 0.5, 1.5))
  const addEffect = useGameStore((s) => s.addEffect)
  const registerHit = useGameStore((s) => s.registerHit)
  const spawnDecal = useGameStore((s) => s.spawnDecal)
  const currentWeapon = useGameStore((s) => s.currentWeapon)
  const { weapon, canShoot, getRecoil, lastShot } = useWeapon(currentWeapon)
  const flashRef = useRef<MuzzleFlashHandle>(null)
  const flashGroup = useRef<THREE.Group>(null)

  useFrame(() => {
    playerPos.current.copy(camera.position)
    ;(window as any).sceneEnemies = scene.children
    if (flashGroup.current) camera.add(flashGroup.current)
  })

  const spawnDirectionalSpray = useCallback((position: THREE.Vector3, direction: THREE.Vector3, count: number) => {
    for (let i = 0; i < count; i++) {
      addEffect({ type: 'blood', position: position.clone(), normal: direction.clone(), intensity: 2 + Math.random() })
    }
  }, [addEffect])

  const shoot = useCallback(() => {
    const time = performance.now() / 1000
    if (!canShoot(time)) return

    lastShot.current = time
    flashRef.current?.fire()

    const spreadX = (Math.random() - 0.5) * weapon.spread
    const spreadY = (Math.random() - 0.5) * weapon.spread

    const direction = new THREE.Vector3()
    camera.getWorldDirection(direction)
    direction.x += spreadX
    direction.y += spreadY

    const raycaster = new THREE.Raycaster(camera.position, direction.normalize())
    const intersects = raycaster.intersectObjects(scene.children, true)

    const recoil = getRecoil()
    camera.rotation.x -= recoil

    if (intersects.length > 0) {
      const hit = intersects[0]
      const isHead = hit.object.name === 'head'

      registerHit(isHead ? 'head' : 'body')
      addEffect({ type: 'blood', position: hit.point.clone(), normal: hit.face?.normal.clone(), intensity: isHead ? weapon.headshotMultiplier : 1 })

      spawnDecal({
        position: hit.point.clone(),
        normal: hit.face?.normal.clone() ?? new THREE.Vector3(0, 1, 0),
      })

      if (isHead) {
        spawnDirectionalSpray(hit.point, camera.getWorldDirection(new THREE.Vector3()), weapon.sprayCount)
      }

      let obj: THREE.Object3D | null = hit.object
      while (obj) {
        if (obj.userData?.onHit) { obj.userData.onHit(isHead); break }
        obj = obj.parent
      }
    }
  }, [camera, scene, weapon, canShoot, getRecoil, lastShot, registerHit, addEffect, spawnDecal, spawnDirectionalSpray])

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (document.pointerLockElement !== gl.domElement) return
      if (e.button === 0) shoot()
    }
    window.addEventListener('mousedown', onMouseDown)
    return () => window.removeEventListener('mousedown', onMouseDown)
  }, [gl, shoot])

  const handleDeath = useCallback((pos: THREE.Vector3) => {
    addEffect({ type: 'blood', position: pos, intensity: 1.5 })
  }, [addEffect])

  return (
    <>
      <ambientLight intensity={0.2} />
      <fog attach="fog" args={['#000000', 5, 20]} />
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
      <group ref={flashGroup}>
        <MuzzleFlash ref={flashRef} />
      </group>
    </>
  )
}

function Overlay() {
  const phase = useGameStore((s) => s.phase)
  const setPhase = useGameStore((s) => s.setPhase)
  const health = useGameStore((s) => s.health)
  const score = useGameStore((s) => s.score)

  if (phase === 'playing') return null

  const isDead = phase === 'dead'
  return (
    <div style={overlayStyle}>
      <h1 style={{ color: isDead ? '#cc2222' : '#fff', fontSize: 48, margin: 0 }}>
        {isDead ? 'YOU DIED' : 'MODUS OPERANDI'}
      </h1>
      {isDead && <p style={{ color: '#aaa', margin: '8px 0 24px' }}>Score: {score}</p>}
      <button
        style={btnStyle}
        onClick={() => {
          useGameStore.setState({ health: 100, score: 0, phase: 'playing' })
        }}
      >
        {isDead ? 'RESPAWN' : 'START'}
      </button>
    </div>
  )
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0,
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(0,0,0,0.82)',
  fontFamily: 'monospace',
  zIndex: 10,
}

const btnStyle: React.CSSProperties = {
  marginTop: 16, padding: '10px 32px',
  background: '#222', color: '#fff',
  border: '1px solid #555', fontSize: 18,
  cursor: 'pointer', letterSpacing: 3,
}

export default function Game() {
  return (
    <>
      <Canvas
        camera={{ fov: 75, near: 0.05, far: 22, position: [1.5, 0.5, 1.5] }}
        style={{ width: '100vw', height: '100vh', background: '#000' }}
      >
        <Scene />
      </Canvas>
      <HUD />
      <Overlay />
    </>
  )
}
