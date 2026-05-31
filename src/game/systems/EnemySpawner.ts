import * as Phaser from "phaser";
import { GAME_HEIGHT } from "../constants";
import type { DifficultySystem } from "./DifficultySystem";
import type { Enemy } from "../entities/Enemy";

/**
 * Spawns enemies on a self-adjusting timer. Spawning can be paused (e.g. during
 * boss fights) without destroying the timer.
 */
export class EnemySpawner {
  private scene: Phaser.Scene;
  private difficulty: DifficultySystem;
  private spawnEnemy: () => Enemy | null;
  private nextSpawnAt = 0;
  private enabled = false;

  constructor(
    scene: Phaser.Scene,
    difficulty: DifficultySystem,
    spawnEnemy: () => Enemy | null,
  ) {
    this.scene = scene;
    this.difficulty = difficulty;
    this.spawnEnemy = spawnEnemy;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (enabled) {
      this.nextSpawnAt = this.scene.time.now + 500;
    }
  }

  update(time: number): void {
    if (!this.enabled) return;
    if (time < this.nextSpawnAt) return;
    this.spawnEnemy();
    this.nextSpawnAt = time + this.difficulty.getSpawnDelay();
  }

  /** Helper to pick a sensible vertical spawn position with margins. */
  static randomY(): number {
    return Phaser.Math.Between(60, GAME_HEIGHT - 60);
  }
}
