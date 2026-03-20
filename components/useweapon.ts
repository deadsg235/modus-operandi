import { useRef } from 'react'
import { WEAPONS, WeaponType } from '../store/useGameStore'

export function useWeapon(currentWeapon: WeaponType) {
  const lastShot = useRef(0)
  const recoilIndex = useRef(0)

  const weapon = WEAPONS[currentWeapon]

  function canShoot(time: number) {
    return time - lastShot.current > weapon.fireRate
  }

  function getRecoil() {
    const value =
      weapon.recoilPattern[
        recoilIndex.current % weapon.recoilPattern.length
      ]

    recoilIndex.current++
    return value
  }

  function resetRecoil() {
    recoilIndex.current = 0
  }

  return {
    weapon,
    canShoot,
    getRecoil,
    resetRecoil,
    lastShot,
  }
}