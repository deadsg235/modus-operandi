import { create } from 'zustand'
import * as THREE from 'three'

type Vec3 = { x: number; y: number; z: number }

type Effect = {
  type: 'blood'
  position: THREE.Vector3
  normal?: THREE.Vector3
  intensity?: number
}

export type Decal = {
  position: THREE.Vector3
  normal: THREE.Vector3
}

type Enemy = {
  id: string
  position: Vec3
  health: number
  alive: boolean
}

type RemotePlayer = {
  id: string
  position: Vec3
  rotation: number
  health: number
}

type GamePhase = 'lobby' | 'playing' | 'dead'

export type WeaponType = 'AR' | 'Shotgun' | 'Pistol'

export const WEAPONS: Record<WeaponType, {
  name: string
  damage: number
  headshotMultiplier: number
  sprayCount: number
  fireRate: number
  recoilPattern: number[]
  spread: number
  automatic: boolean
}> = {
  AR:      { name: 'VX-9 AR',  damage: 20, headshotMultiplier: 2,   sprayCount: 5,  fireRate: 0.08, recoilPattern: [0.002, 0.0025, 0.003, 0.0035, 0.004], spread: 0.01,  automatic: true },
  Shotgun: { name: 'KITE SMG', damage: 12, headshotMultiplier: 1.8, sprayCount: 10, fireRate: 0.05, recoilPattern: [0.001, 0.0012, 0.0015],               spread: 0.03,  automatic: true },
  Pistol:  { name: 'M-11',     damage: 35, headshotMultiplier: 2.5, sprayCount: 3,  fireRate: 0.2,  recoilPattern: [0.004],                               spread: 0.005, automatic: false },
}

type HitMarker = { id: number; type: 'body' | 'head' }
type DamageNumber = { id: number; dmg: number; position: THREE.Vector3 }
type KillFeedEntry = { id: number; text: string }
type ScreenPos = { x: number; y: number }

type GameState = {
  health: number
  score: number
  position: Vec3
  rotation: number
  phase: GamePhase
  players: RemotePlayer[]
  enemies: Enemy[]
  effects: Effect[]
  decals: Decal[]
  currentWeapon: WeaponType
  walletAddress: string | null
  solBalance: number
  crosshairSpread: number
  hitMarkers: HitMarker[]
  damageNumbers: DamageNumber[]
  damagePositions: Record<number, ScreenPos>
  killFeed: KillFeedEntry[]
  lastDamageTime: number
  lastRegenTick: number

  setWeapon: (w: WeaponType) => void
  setCrosshairSpread: (v: number) => void
  addHitMarker: (type: 'body' | 'head') => void
  addDamageNumber: (dmg: number, position: THREE.Vector3) => void
  setDamagePositions: (positions: Record<number, ScreenPos>) => void
  addKill: (text: string) => void
  addEffect: (effect: Effect) => void
  spawnDecal: (decal: Decal) => void
  registerHit: (type: 'body' | 'head') => void
  takeDamage: (amount: number) => void
  regenHealth: () => void
  setPosition: (position: Vec3, rotation: number) => void
  setPhase: (phase: GamePhase) => void
  setWallet: (address: string, balance: number) => void
  syncPlayers: (players: RemotePlayer[]) => void
  syncEnemies: (enemies: Enemy[]) => void
}

export const useGameStore = create<GameState>((set) => ({
  health: 100,
  score: 0,
  position: { x: 0, y: 0, z: 0 },
  rotation: 0,
  phase: 'lobby',
  players: [],
  enemies: [],
  effects: [],
  decals: [],
  currentWeapon: 'AR',
  walletAddress: null,
  solBalance: 0,
  crosshairSpread: 0,
  hitMarkers: [],
  damageNumbers: [],
  damagePositions: {},
  killFeed: [],
  lastDamageTime: 0,
  lastRegenTick: 0,

  setWeapon: (w) => set({ currentWeapon: w }),
  setCrosshairSpread: (v) => set({ crosshairSpread: v }),

  addHitMarker: (type) =>
    set((s) => ({ hitMarkers: [...s.hitMarkers, { id: Date.now(), type }] })),

  addDamageNumber: (dmg, position) =>
    set((s) => ({ damageNumbers: [...s.damageNumbers, { id: Date.now(), dmg, position }] })),

  setDamagePositions: (positions) => set({ damagePositions: positions }),

  addKill: (text) =>
    set((s) => ({ killFeed: [...s.killFeed.slice(-4), { id: Date.now(), text }] })),

  addEffect: (effect) =>
    set((state) => ({ effects: [...state.effects, effect] })),

  spawnDecal: (decal) =>
    set((state) => ({ decals: [...state.decals, decal] })),

  registerHit: (type) =>
    set((state) => ({ score: state.score + 10 * (type === 'head' ? 2 : 1) })),

  takeDamage: (amount) =>
    set((state) => {
      const health = Math.max(0, state.health - amount)
      return { health, phase: health === 0 ? 'dead' : state.phase, lastDamageTime: Date.now() }
    }),

  regenHealth: () =>
    set((state) => {
      if (state.phase !== 'playing') return {}
      if (Date.now() - state.lastDamageTime < 3000) return {}
      if (state.health >= 100) return {}
      if (Date.now() - state.lastRegenTick < 1000) return {}
      return { health: Math.min(100, state.health + 2), lastRegenTick: Date.now() }
    }),

  setPosition: (position, rotation) => set({ position, rotation }),
  setPhase: (phase) => set({ phase }),
  setWallet: (walletAddress, solBalance) => set({ walletAddress, solBalance }),
  syncPlayers: (players) => set({ players }),
  syncEnemies: (enemies) => set({ enemies }),
}))
