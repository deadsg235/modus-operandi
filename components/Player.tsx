'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { MAP } from './Map'
import { useGameStore } from '../store/useGameStore'

const SPEED = 7
const HALF_PI = Math.PI / 2

function isSolid(x: number, z: number) {
  const col = Math.floor(x)
  const row = Math.floor(z)
  return MAP[row]?.[col] === 1
}

export default function Player() {
  const { camera, gl } = useThree()
  const keys = useRef<Record<string, boolean>>({})
  const yaw = useRef(0)
  const pitch = useRef(0)
  const phase = useGameStore((s) => s.phase)
  const setWeapon = useGameStore((s) => s.setWeapon)
  const regenHealth = useGameStore((s) => s.regenHealth)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      keys.current[e.code] = e.type === 'keydown'
      if (e.type === 'keydown') {
        if (e.code === 'Digit1') setWeapon('AR')
        if (e.code === 'Digit2') setWeapon('Shotgun')
        if (e.code === 'Digit3') setWeapon('Pistol')
      }
    }
    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== gl.domElement) return
      yaw.current -= e.movementX * 0.002
      pitch.current = Math.max(-HALF_PI + 0.05, Math.min(HALF_PI - 0.05, pitch.current - e.movementY * 0.002))
    }
    const onClick = () => {
      if (phase === 'playing') gl.domElement.requestPointerLock()
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKey)
    window.addEventListener('mousemove', onMouseMove)
    gl.domElement.addEventListener('click', onClick)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup', onKey)
      window.removeEventListener('mousemove', onMouseMove)
      gl.domElement.removeEventListener('click', onClick)
    }
  }, [gl, phase, setWeapon])

  useFrame((_, delta) => {
    if (phase !== 'playing') return
    regenHealth()

    // Force YXZ every frame — R3F must not override this
    camera.rotation.order = 'YXZ'
    camera.rotation.y = yaw.current
    camera.rotation.x = pitch.current
    camera.rotation.z = 0

    const forward = new THREE.Vector3(-Math.sin(yaw.current), 0, -Math.cos(yaw.current))
    const right   = new THREE.Vector3( Math.cos(yaw.current), 0, -Math.sin(yaw.current))
    const move    = new THREE.Vector3()

    if (keys.current['KeyW']) move.add(forward)
    if (keys.current['KeyS']) move.sub(forward)
    if (keys.current['KeyA']) move.sub(right)
    if (keys.current['KeyD']) move.add(right)

    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(SPEED * delta)
      const nx = camera.position.x + move.x
      const nz = camera.position.z + move.z
      if (!isSolid(nx, camera.position.z)) camera.position.x = nx
      if (!isSolid(camera.position.x, nz)) camera.position.z = nz
    }

    camera.position.y = 0.5
  })

  return null
}
