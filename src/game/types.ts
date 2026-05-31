/**
 * Shared domain types for Sky Strike.
 */

export type Difficulty = "easy" | "normal" | "hard";

export type EnemyType = "A" | "B" | "C" | "D";

export type ItemType = "heal" | "score" | "rapid" | "power" | "shield";

export type SceneState =
  | "loading"
  | "title"
  | "playing"
  | "paused"
  | "boss"
  | "gameover";

/** Snapshot of game state pushed to the React HUD each frame (throttled). */
export interface HudSnapshot {
  score: number;
  highScore: number;
  hp: number;
  maxHp: number;
  shield: boolean;
  /** Remaining seconds of power (overdrive) shot, 0 when inactive. */
  powerTimeLeft: number;
  /** Remaining seconds of rapid fire, 0 when inactive. */
  rapidTimeLeft: number;
  /** Boss HP ratio 0..1, or null when no boss is active. */
  bossHpRatio: number | null;
  difficulty: Difficulty;
  wave: number;
  /** Current weapon display name. */
  weaponName: string;
  /** 1-based weapon tier the player has reached. */
  weaponLevel: number;
  /** Total number of weapon tiers. */
  weaponMax: number;
  /** Progress 0..1 toward the next weapon tier (1 when maxed). */
  weaponProgress: number;
  /** HUD accent color (CSS) for the active weapon. */
  weaponColor: string;
}

/** One projectile emitted per weapon shot. */
export interface WeaponShot {
  /** Bullet texture key generated in BootScene. */
  texture: string;
  /** Angle offset from straight-right, in degrees. */
  angleDeg: number;
  damage: number;
  speed: number;
  /** How many enemies the bullet can pass through (0 = none). */
  pierce: number;
  /** Vertical muzzle offset from the ship centre. */
  yOffset: number;
}

/** A weapon tier unlocked by accumulating score. */
export interface WeaponTier {
  name: string;
  /** Cumulative score required to unlock this tier. */
  threshold: number;
  cooldownMs: number;
  rapidCooldownMs: number;
  /** HUD accent color (CSS). */
  color: string;
  shots: WeaponShot[];
}

/** Directional + action input shared between keyboard and mobile controls. */
export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  fire: boolean;
  slow: boolean;
}

export interface GameOverPayload {
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  difficulty: Difficulty;
}

export interface DifficultyConfig {
  label: string;
  /** Multiplier applied to enemy spawn rate. */
  spawnRateMul: number;
  /** Multiplier applied to enemy & enemy-bullet speed. */
  speedMul: number;
  /** Multiplier applied to enemy fire frequency. */
  fireRateMul: number;
  /** Player starting HP. */
  playerHp: number;
  /** Item drop chance 0..1. */
  itemDropChance: number;
  /** Score needed to trigger the boss. */
  bossScore: number;
}
