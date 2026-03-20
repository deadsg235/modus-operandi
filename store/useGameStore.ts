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
  AR:      { name: 'VX-9 AR', damage: 20, headshotMultiplier: 2, sprayCount: 5, fireRate: 0.08, recoilPattern: [0.002, 0.0025, 0.003, 0.0035, 0.004], spread: 0.01, automatic: true },
  Shotgun: { name: 'KITE SMG', damage: 12, headshotMultiplier: 1.8, sprayCount: 10, fireRate: 0.05, recoilPattern: [0.001, 0.0012, 0.0015], spread: 0.03, automatic: true },
  Pistol:  { name: 'M-11', damage: 35, headshotMultiplier: 2.5, sprayCount: 3, fireRate: 0.2, recoilPattern: [0.004], spread: 0.005, automatic: false },
}

type HitMarker = { id: number; type: 'body' | 'head' }
type DamageNumber = { id: number; dmg: number; position: THREE.Vector3 }
type KillFeedEntry = { id: number; text: string }
type ScreenPos = { x: number; y: number }

type GameState = {
  // Player
  health: number
  score: number
  position: Vec3
  rotation: number
  phase: GamePhase

  // Multiplayer
  players: RemotePlayer[]
  enemies: Enemy[]

  // Effects
  effects: Effect[]
  decals: Decal[]

  // Weapon
  currentWeapon: WeaponType
  setWeapon: (w: WeaponType) => void

  // Solana
  walletAddress: string | null
  solBalance: number

  // HUD
  crosshairSpread: number
  setCrosshairSpread: (v: number) => void
  hitMarkers: HitMarker[]
  addHitMarker: (type: 'body' | 'head') => void
  damageNumbers: DamageNumber[]
  addDamageNumber: (dmg: number, position: THREE.Vector3) => void
  damagePositions: Record<number, ScreenPos>
  setDamagePositions: (positions: Record<number, ScreenPos>) => void
  killFeed: KillFeedEntry[]
  addKill: (text: string) => void

  // Actions
  addEffect: (effect: Effect) => void
  spawnDecal: (decal: Decal) => void
  registerHit: (type: 'body' | 'head') => void
  takeDamage: (amount: number) => void
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

  addEffect: (effect) =>
    set((state) => ({ effects: [...state.effects, effect] })),

  spawnDecal: (decal) =>
    set((state) => ({ decals: [...state.decals, decal] })),

  registerHit: (type) =>
    set((state) => ({
      score: state.score + 10 * (type === 'head' ? 2 : 1),
    })),

  takeDamage: (amount) =>
    set((state) => {
      const health = Math.max(0, state.health - amount)
      return { health, phase: health === 0 ? 'dead' : state.phase }
    }),

  setPosition: (position, rotation) => set({ position, rotation }),

  setPhase: (phase) => set({ phase }),

  setWallet: (walletAddress, solBalance) => set({ walletAddress, solBalance }),

  syncPlayers: (players) => set({ players }),

  setWeapon: (w) => set({ currentWeapon: w }),

  syncEnemies: (enemies) => set({ enemies }),

  crosshairSpread: 0,
  setCrosshairSpread: (v) => set({ crosshairSpread: v }),

  hitMarkers: [],
  addHitMarker: (type) =>
    set((s) => ({ hitMarkers: [...s.hitMarkers, { id: Date.now(), type }] })),

  damageNumbers: [],
  addDamageNumber: (dmg, position) =>
    set((s) => ({ damageNumbers: [...s.damageNumbers, { id: Date.now(), dmg, position }] })),
  damagePositions: {},
  setDamagePositions: (positions) => set({ damagePositions: positions }),

  killFeed: [],
  addKill: (text) =>
    set((s) => ({ killFeed: [...s.killFeed.slice(-4), { id: Date.now(), text }] })),
}))
