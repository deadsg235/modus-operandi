'use client'

import dynamic from 'next/dynamic'
import { useGameStore } from '../store/useGameStore'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useEffect } from 'react'

const Game = dynamic(() => import('../components/Game'), { ssr: false })

export default function Page() {
  const phase = useGameStore((s) => s.phase)
  const setPhase = useGameStore((s) => s.setPhase)
  const health = useGameStore((s) => s.health)
  const score = useGameStore((s) => s.score)
  const setWallet = useGameStore((s) => s.setWallet)
  const { publicKey, connected } = useWallet()

  useEffect(() => {
    if (connected && publicKey) {
      setWallet(publicKey.toBase58(), 0)
    }
  }, [connected, publicKey, setWallet])

  const restart = () => {
    useGameStore.setState({ health: 100, score: 0, phase: 'playing' })
  }

  if (phase === 'lobby') {
    return (
      <div style={overlay}>
        <h1 style={{ fontSize: 48, color: '#ff2222', letterSpacing: 4 }}>MODUS OPERANDI</h1>
        <p style={{ color: '#aaa', margin: '12px 0 24px' }}>First-person arena shooter</p>
        <WalletMultiButton />
        <button style={btn} onClick={() => setPhase('playing')}>
          PLAY
        </button>
      </div>
    )
  }

  if (phase === 'dead') {
    return (
      <div style={overlay}>
        <h1 style={{ fontSize: 48, color: '#ff2222' }}>YOU DIED</h1>
        <p style={{ color: '#fff', fontSize: 24, margin: '12px 0 24px' }}>Score: {score}</p>
        <button style={btn} onClick={restart}>RETRY</button>
        <button style={{ ...btn, background: '#333', marginLeft: 12 }} onClick={() => setPhase('lobby')}>MENU</button>
      </div>
    )
  }

  return <Game />
}

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0,
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
  background: '#0a0a0a',
  color: '#fff', fontFamily: 'monospace',
}

const btn: React.CSSProperties = {
  marginTop: 16, padding: '12px 32px',
  background: '#cc0000', color: '#fff',
  border: 'none', fontSize: 18,
  cursor: 'pointer', letterSpacing: 2,
  fontFamily: 'monospace',
}
