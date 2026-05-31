import * as Phaser from "phaser";
import { SCORE } from "../config";
import type { EnemyType } from "../types";

interface EnemyStats {
  hp: number;
  baseSpeed: number;
  score: number;
  texture: string;
}

const STATS: Record<EnemyType, EnemyStats> = {
  A: { hp: 2, baseSpeed: 120, score: SCORE.enemyA, texture: "enemyA" },
  B: { hp: 3, baseSpeed: 100, score: SCORE.enemyB, texture: "enemyB" },
  C: { hp: 3, baseSpeed: 80, score: SCORE.enemyC, texture: "enemyC" },
  D: { hp: 1, baseSpeed: 300, score: SCORE.enemyD, texture: "enemyD" },
};

/**
 * Generic enemy supporting four behaviour profiles (A/B/C/D).
 * Movement and firing logic live in preUpdate so the Phaser loop drives them.
 */
export class Enemy extends Phaser.Physics.Arcade.Sprite {
  enemyType: EnemyType = "A";
  hp = 1;
  scoreValue = 0;

  private baseY = 0;
  private waveAmp = 0;
  private waveFreq = 0;
  private spawnTime = 0;
  private nextFireAt = 0;
  private fireIntervalMs = 1600;

  /** Set once by the scene; lets type-C enemies request a bullet. */
  onFire?: (enemy: Enemy) => void;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, "enemyA");
  }

  spawn(
    type: EnemyType,
    x: number,
    y: number,
    speedMul: number,
    fireRateMul: number,
  ): void {
    const stats = STATS[type];
    this.enemyType = type;
    this.hp = stats.hp;
    this.scoreValue = stats.score;
    this.setTexture(stats.texture);

    this.enableBody(true, x, y, true, true);
    this.setActive(true);
    this.setVisible(true);
    this.clearTint();
    this.setAngle(0);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setVelocity(-stats.baseSpeed * speedMul, 0);

    this.baseY = y;
    this.spawnTime = this.scene.time.now;
    this.waveAmp = type === "B" ? Phaser.Math.Between(50, 90) : 0;
    this.waveFreq = Phaser.Math.FloatBetween(0.003, 0.005);
    this.fireIntervalMs = Math.max(700, 1700 / fireRateMul);
    this.nextFireAt = this.scene.time.now + Phaser.Math.Between(500, 1400);
  }

  /** Returns true if the enemy died from this hit. */
  hit(damage: number): boolean {
    this.hp -= damage;
    this.flash();
    return this.hp <= 0;
  }

  private flash(): void {
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(60, () => {
      if (this.active) this.clearTint();
    });
  }

  deactivate(): void {
    this.disableBody(true, true);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    if (this.enemyType === "B") {
      const t = time - this.spawnTime;
      this.y = this.baseY + Math.sin(t * this.waveFreq) * this.waveAmp;
    }

    if (this.enemyType === "C" && time >= this.nextFireAt) {
      this.nextFireAt = time + this.fireIntervalMs;
      this.onFire?.(this);
    }

    if (this.x < -60) {
      this.deactivate();
    }
  }
}
