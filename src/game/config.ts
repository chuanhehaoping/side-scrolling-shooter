/**
 * Tunable gameplay configuration and per-difficulty balance.
 */
import type { Difficulty, DifficultyConfig } from "./types";

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
