'use client'

import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import GameMap from './Map'
import Player from './Player'
import Enemy from './Enemy'
import HUD from './HUD'
import MuzzleFlash, { type MuzzleFlashHandle } from './MuzzleFlash'
import { useGameStore } from '../store/useGameStore'
import { useWeapon } from './useweapon'

// Player starts at [1.5, 0.5, 1.5] — all spawns are far corners/edges
const ENEMY_STARTS = [
  new THREE.Vector3(14.5, 0.5, 14.5),
  new THREE.Vector3(13.5, 0.5, 1.5),
  new THREE.Vector3(1.5,  0.5, 13.5),
  new THREE.Vector3(14.5, 0.5, 7.5),
  new THREE.Vector3(7.5,  0.5, 14.5),
  new THREE.Vector3(13.5, 0.5, 10.5),
  new THREE.Vector3(10.5, 0.5, 13.5),
  new THREE.Vector3(14.5, 0.5, 3.5),
  new THREE.Vector3(3.5,  0.5, 14.5),
]

const TORCH_POSITIONS: [number, number, number][] = [
  [3.5,  2.5, 3.5],
  [12.5, 2.5, 3.5],
  [7.5,  2.5, 7.5],
  [3.5,  2.5, 12.5],
  [12.5, 2.5, 12.5],
  [8.5,  2.5, 2.5],
  [2.5,  2.5, 8.5],
  [13.5, 2.5, 8.5],
  [8.5,  2.5, 13.5],
]

function FlickerLight({ position }: { position: [number, number, number] }) {
  const light = useRef<THREE.PointLight>(null)
  const offset = useRef(Math.random() * 100)
  useFrame(({ clock }) => {
    if (!light.current) return
    const t = clock.elapsedTime + offset.current
    light.current.intensity = 6 + Math.sin(t * 9) * 0.8 + Math.sin(t * 3.3) * 0.4
  })
  return <pointLight ref={light} position={position} intensity={6} distance={18} color="#ff9944" decay={2} />
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

  useEffect(() => {
    const id = setInterval(() => {
      const hits = pendingHits.current.splice(0)
      if (!hits.length) return
      const { registerHit, addHitMarker } = useGameStore.getState()
      for (const h of hits) {
        registerHit(h.isHead ? 'head' : 'body')
        addHitMarker(h.isHead ? 'head' : 'body')
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
      <ambientLight intensity={4} color="#ffddbb" />
      <directionalLight intensity={2} color="#ffeecc" position={[8, 8, 8]} />
      <fog attach="fog" args={['#2a1a0a', 20, 40]} />
      {TORCH_POSITIONS.map((pos, i) => <FlickerLight key={i} position={pos} />)}
      <GameMap />
      {ENEMY_STARTS.map((pos, i) => (
        <Enemy key={i} id={`enemy-${i}`} index={i} startPos={pos} playerPos={playerPos} />
      ))}
      <Player />
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
      <div style={{ letterSpacing: 12, fontSize: 11, color: '#550000', marginBottom: 8, fontFamily: 'monospace' }}>
        ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
      </div>
      <h1 style={{ color: isDead ? '#ff0000' : '#cc0000', fontSize: 52, margin: 0, letterSpacing: 8, fontFamily: 'monospace', textShadow: '0 0 30px #ff000088' }}>
        {isDead ? 'YOU DIED' : 'MODUS OPERANDI'}
      </h1>
      {isDead && (
        <p style={{ color: '#660000', margin: '10px 0 0', fontSize: 18, fontFamily: 'monospace', letterSpacing: 4 }}>
          SCORE: <span style={{ color: '#ff4444' }}>{score}</span>
        </p>
      )}
      <div style={{ width: 200, height: 1, background: '#330000', margin: '24px 0' }} />
      <button style={btnStyle} onClick={() => useGameStore.setState({ health: 100, score: 0, phase: 'playing' })}>
        {isDead ? '[ RESPAWN ]' : '[ ENTER ]'}
      </button>
      {!isDead && (
        <div style={{ marginTop: 24, color: '#440000', fontFamily: 'monospace', fontSize: 11, letterSpacing: 2 }}>
          WASD · MOUSE · 1/2/3 WEAPON
        </div>
      )}
    </div>
  )
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0,
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  background: 'radial-gradient(ellipse at center, #0d0000 0%, #000000 100%)',
  fontFamily: 'monospace', zIndex: 10,
}
const btnStyle: React.CSSProperties = {
  padding: '10px 36px',
  background: 'transparent',
  color: '#cc0000',
  border: '1px solid #550000',
  fontSize: 16, cursor: 'pointer', letterSpacing: 6, fontFamily: 'monospace',
  textShadow: '0 0 10px #ff000066',
  boxShadow: '0 0 20px #33000044',
  transition: 'all 0.15s',
}

export default function Game() {
  return (
    <>
      <Canvas
        camera={{ fov: 80, near: 0.05, far: 32, position: [1.5, 0.5, 1.5] }}
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
