import * as Phaser from "phaser";
import type { DifficultyConfig, EnemyType } from "../types";

/**
 * Scales challenge over time and score. Produces spawn cadence, speed/fire
 * multipliers and an enemy-type distribution that grows more varied as the
 * run progresses — while staying within fair bounds.
 */
export class DifficultySystem {
  private config: DifficultyConfig;
  private startTime = 0;
  private level = 0;

  constructor(config: DifficultyConfig) {
    this.config = config;
  }

  start(time: number): void {
    this.startTime = time;
    this.level = 0;
  }

  /** Recomputes the difficulty level from elapsed time and score. */
  update(time: number, score: number): void {
    const elapsedSec = (time - this.startTime) / 1000;
    const fromTime = Math.floor(elapsedSec / 22);
    const fromScore = Math.floor(score / 1800);
    this.level = Math.min(10, fromTime + fromScore);
  }

  get currentLevel(): number {
    return this.level;
  }

  /** Milliseconds between enemy spawns (lower = harder), clamped for fairness. */
  getSpawnDelay(): number {
    const base = 1250 - this.level * 75;
    const fair = Math.max(420, base);
    return fair / this.config.spawnRateMul;
  }

  getSpeedMul(): number {
    return this.config.speedMul * (1 + this.level * 0.04);
  }

  getFireRateMul(): number {
    return this.config.fireRateMul * (1 + this.level * 0.05);
  }

  /** Weighted random enemy type; harder types unlock with level. */
  pickEnemyType(): EnemyType {
    const weights: Record<EnemyType, number> = {
      A: 5,
      D: this.level >= 1 ? 2 : 1,
      B: this.level >= 2 ? 3 : 0,
      C: this.level >= 3 ? 3 : 0,
    };
    const total = weights.A + weights.B + weights.C + weights.D;
    let roll = Phaser.Math.FloatBetween(0, total);
    const order: EnemyType[] = ["A", "B", "C", "D"];
    for (const type of order) {
      roll -= weights[type];
      if (roll <= 0) return type;
    }
    return "A";
  }
}
