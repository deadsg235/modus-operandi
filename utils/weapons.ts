export const weapons = {
  AR: {
    name: 'VX-9 AR',
    fireRate: 0.08,
    recoilPattern: [0.2, 0.25, 0.3, 0.35, 0.4],
    spread: 0.01,
    damage: 20,
    headshotMultiplier: 2,
    automatic: true,
  },

  SMG: {
    name: 'KITE SMG',
    fireRate: 0.05,
    recoilPattern: [0.1, 0.12, 0.15],
    spread: 0.03,
    damage: 12,
    headshotMultiplier: 1.8,
    automatic: true,
  },

  PISTOL: {
    name: 'M-11',
    fireRate: 0.2,
    recoilPattern: [0.4],
    spread: 0.005,
    damage: 35,
    headshotMultiplier: 2.5,
    automatic: false,
  },
}