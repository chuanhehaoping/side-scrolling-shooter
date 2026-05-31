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
  /** Remaining seconds of power (3-way) shot, 0 when inactive. */
  powerTimeLeft: number;
  /** Remaining seconds of rapid fire, 0 when inactive. */
  rapidTimeLeft: number;
  /** Boss HP ratio 0..1, or null when no boss is active. */
  bossHpRatio: number | null;
  difficulty: Difficulty;
  wave: number;
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
