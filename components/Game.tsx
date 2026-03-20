'use client'

import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { useRef, useEffect } from 'react'
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

const ENEMY_STARTS = [
  new THREE.Vector3(7.5, 0.5, 7.5),
  new THREE.Vector3(10.5, 0.5, 2.5),
  new THREE.Vector3(2.5, 0.5, 10.5),
  new THREE.Vector3(13.5, 0.5, 10.5),
  new THREE.Vector3(10.5, 0.5, 13.5),
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
    light.current.intensity = 1.4 + Math.sin(t * 7) * 0.2
  })
  return <pointLight ref={light} position={position} intensity={1.5} distance={14} color="#ffbb66" decay={2} />
}

type PendingHit = { point: THREE.Vector3; normal: THREE.Vector3; isHead: boolean; onHit: (h: boolean) => void }

function Scene() {
  const { camera, scene } = useThree()
  const playerPos = useRef(new THREE.Vector3(1.5, 0.5, 1.5))
  const currentWeapon = useGameStore((s) => s.currentWeapon)
  const phase = useGameStore((s) => s.phase)
  const { weapon, canShoot, lastShot } = useWeapon(currentWeapon)
  const flashRef = useRef<MuzzleFlashHandle>(null)
  const flashGroup = useRef<THREE.Group>(null)
  const flashAdded = useRef(false)
  const isMouseDown = useRef(false)
  const firedThisPress = useRef(false)
  const pendingHits = useRef<PendingHit[]>([])

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

  // Flush pending hits to Zustand OUTSIDE the render loop
  useEffect(() => {
    const id = setInterval(() => {
      const hits = pendingHits.current.splice(0)
      if (!hits.length) return
      const { addEffect, spawnDecal, registerHit, addHitMarker } = useGameStore.getState()
      for (const h of hits) {
        registerHit(h.isHead ? 'head' : 'body')
        addHitMarker(h.isHead ? 'head' : 'body')
        addEffect({ type: 'blood', position: h.point, normal: h.normal, intensity: h.isHead ? 2 : 1 })
        spawnDecal({ position: h.point, normal: h.normal })
        h.onHit(h.isHead)
      }
    }, 16)
    return () => clearInterval(id)
  }, [])

  useFrame(() => {
    playerPos.current.copy(camera.position)

    if (phase !== 'playing' || !document.pointerLockElement) return
    if (!isMouseDown.current) return
    if (!weapon.automatic && firedThisPress.current) return

    const time = performance.now() / 1000
    if (!canShoot(time)) return

    lastShot.current = time
    firedThisPress.current = true
    flashRef.current?.fire()

    const dir = new THREE.Vector3()
    camera.getWorldDirection(dir)
    dir.x += (Math.random() - 0.5) * weapon.spread
    dir.y += (Math.random() - 0.5) * weapon.spread
    dir.normalize()

    const ray = new THREE.Raycaster(camera.position.clone(), dir)
    const hits = ray.intersectObjects(scene.children, true)
    if (!hits.length) return

    const hit = hits[0]
    const isHead = hit.object.name === 'head'
    const normal = hit.face?.normal.clone() ?? new THREE.Vector3(0, 1, 0)

    // Find onHit callback without calling it mid-frame
    let onHit = (_: boolean) => {}
    let obj: THREE.Object3D | null = hit.object
    while (obj) {
      if (obj.userData?.onHit) { onHit = obj.userData.onHit; break }
      obj = obj.parent
    }

    pendingHits.current.push({ point: hit.point.clone(), normal, isHead, onHit })
  })

  return (
    <>
      <ambientLight intensity={0.5} />
      <fog attach="fog" args={['#000000', 12, 30]} />
      {TORCH_POSITIONS.map((pos, i) => <FlickerLight key={i} position={pos} />)}
      <GameMap />
      {ENEMY_STARTS.map((pos, i) => (
        <Enemy key={i} id={`enemy-${i}`} startPos={pos} playerPos={playerPos} />
      ))}
      <Player />
      <EffectsManager />
      <DecalManager />
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
      <button style={btnStyle} onClick={() => useGameStore.setState({ health: 100, score: 0, phase: 'playing' })}>
        {isDead ? 'RESPAWN' : 'PLAY'}
      </button>
    </div>
  )
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0,
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(0,0,0,0.88)', fontFamily: 'monospace', zIndex: 10,
}
const btnStyle: React.CSSProperties = {
  marginTop: 20, padding: '12px 40px',
  background: '#cc0000', color: '#fff',
  border: 'none', fontSize: 20, cursor: 'pointer', letterSpacing: 3, fontFamily: 'monospace',
}

export default function Game() {
  return (
    <>
      <Canvas
        camera={{ fov: 75, near: 0.05, far: 30, position: [1.5, 0.5, 1.5] }}
        style={{ width: '100vw', height: '100vh', background: '#000' }}
        onCreated={({ camera }) => { camera.rotation.order = 'YXZ' }}
      >
        <Scene />
      </Canvas>
      <HUD />
      <Overlay />
    </>
  )
}
