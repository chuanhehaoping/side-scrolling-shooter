/**
 * Tunable gameplay configuration and per-difficulty balance.
 */
import type { Difficulty, DifficultyConfig, WeaponShot, WeaponTier } from "./types";

export const PLAYER = {
  baseSpeed: 320,
  slowSpeed: 140,
  fireCooldownMs: 200,
  rapidFireCooldownMs: 95,
  bulletSpeed: 720,
  bulletDamage: 1,
  invulnMsOnHit: 1400,
  hitboxRadius: 8,
  maxTilt: 0.35,
} as const;

export const POWERUP = {
  rapidDurationMs: 8000,
  powerDurationMs: 9000,
  shieldDurationMs: 0, // shield is a one-hit charge, not timed
} as const;

export const ITEM = {
  fallSpeed: 70,
  driftSpeed: 60,
  scoreBonus: 250,
} as const;

export const BOSS = {
  maxHp: 120,
  enterDurationMs: 2200,
  scoreReward: 5000,
  contactDamage: 1,
} as const;

export const SCORE = {
  enemyA: 100,
  enemyB: 150,
  enemyC: 200,
  enemyD: 120,
} as const;

/**
 * Weapon progression. The player's laser evolves through these tiers as their
 * cumulative score grows. Each tier defines its own fire cadence and the set of
 * projectiles emitted per shot. The final tier fires a piercing lance.
 */
export const WEAPONS: WeaponTier[] = [
  {
    name: "PULSE",
    threshold: 0,
    cooldownMs: 200,
    rapidCooldownMs: 95,
    color: "#fff27a",
    shots: [{ texture: "bPulse", angleDeg: 0, damage: 1, speed: 720, pierce: 0, yOffset: 0 }],
  },
  {
    name: "TWIN",
    threshold: 1500,
    cooldownMs: 185,
    rapidCooldownMs: 90,
    color: "#7affd0",
    shots: [
      { texture: "bTwin", angleDeg: 0, damage: 1, speed: 740, pierce: 0, yOffset: -7 },
      { texture: "bTwin", angleDeg: 0, damage: 1, speed: 740, pierce: 0, yOffset: 7 },
    ],
  },
  {
    name: "SPREAD",
    threshold: 4000,
    cooldownMs: 200,
    rapidCooldownMs: 95,
    color: "#5ef2ff",
    shots: [
      { texture: "bPulse", angleDeg: 0, damage: 1, speed: 720, pierce: 0, yOffset: 0 },
      { texture: "bTwin", angleDeg: -11, damage: 1, speed: 700, pierce: 0, yOffset: -4 },
      { texture: "bTwin", angleDeg: 11, damage: 1, speed: 700, pierce: 0, yOffset: 4 },
    ],
  },
  {
    name: "PLASMA",
    threshold: 8000,
    cooldownMs: 235,
    rapidCooldownMs: 120,
    color: "#ff8a3c",
    shots: [
      { texture: "bPlasma", angleDeg: 0, damage: 2, speed: 640, pierce: 0, yOffset: -9 },
      { texture: "bPlasma", angleDeg: 0, damage: 2, speed: 640, pierce: 0, yOffset: 9 },
      { texture: "bPulse", angleDeg: 0, damage: 1, speed: 760, pierce: 0, yOffset: 0 },
    ],
  },
  {
    name: "WAVE",
    threshold: 13000,
    cooldownMs: 215,
    rapidCooldownMs: 105,
    color: "#b07bff",
    shots: [
      { texture: "bWave", angleDeg: 0, damage: 1, speed: 700, pierce: 0, yOffset: 0 },
      { texture: "bWave", angleDeg: -9, damage: 1, speed: 690, pierce: 0, yOffset: -3 },
      { texture: "bWave", angleDeg: 9, damage: 1, speed: 690, pierce: 0, yOffset: 3 },
      { texture: "bWave", angleDeg: -18, damage: 1, speed: 670, pierce: 0, yOffset: -6 },
      { texture: "bWave", angleDeg: 18, damage: 1, speed: 670, pierce: 0, yOffset: 6 },
    ],
  },
  {
    name: "LASER",
    threshold: 20000,
    cooldownMs: 255,
    rapidCooldownMs: 150,
    color: "#ff4fd8",
    shots: [
      { texture: "bLaser", angleDeg: 0, damage: 3, speed: 920, pierce: 4, yOffset: 0 },
      { texture: "bTwin", angleDeg: -8, damage: 1, speed: 760, pierce: 0, yOffset: -10 },
      { texture: "bTwin", angleDeg: 8, damage: 1, speed: 760, pierce: 0, yOffset: 10 },
    ],
  },
];

/**
 * Extra projectiles layered on top of the current weapon while the temporary
 * "power" overdrive item is active — two steep diagonal bolts.
 */
export const OVERDRIVE_SHOTS: WeaponShot[] = [
  { texture: "bPulse", angleDeg: -27, damage: 1, speed: 680, pierce: 0, yOffset: -6 },
  { texture: "bPulse", angleDeg: 27, damage: 1, speed: 680, pierce: 0, yOffset: 6 },
];

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: {
    label: "Easy",
    spawnRateMul: 0.8,
    speedMul: 0.85,
    fireRateMul: 0.7,
    playerHp: 4,
    itemDropChance: 0.28,
    bossScore: 3000,
  },
  normal: {
    label: "Normal",
    spawnRateMul: 1,
    speedMul: 1,
    fireRateMul: 1,
    playerHp: 3,
    itemDropChance: 0.2,
    bossScore: 4000,
  },
  hard: {
    label: "Hard",
    spawnRateMul: 1.3,
    speedMul: 1.2,
    fireRateMul: 1.35,
    playerHp: 3,
    itemDropChance: 0.15,
    bossScore: 5000,
  },
};

/** HUD push throttle to avoid spamming React re-renders. */
export const HUD_THROTTLE_MS = 100;
