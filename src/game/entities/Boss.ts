import * as Phaser from "phaser";
import { BOSS } from "../config";
import { COLORS, DEPTH } from "../constants";
import { audio } from "../audio";

type BossState = "enter" | "fight" | "charge" | "dash";

/**
 * Stage boss. Enters from the right, then cycles through several attack
 * patterns: aimed bursts, fan spreads, and a telegraphed dash attack.
 */
export class Boss extends Phaser.Physics.Arcade.Sprite {
  maxHp: number = BOSS.maxHp;
  hp: number = BOSS.maxHp;

  private phase: BossState = "enter";
  private homeX = 0;
  private nextActionAt = 0;
  private actionCount = 0;
  private alive = true;

  fireBullet?: (x: number, y: number, vx: number, vy: number) => void;
  getPlayerPos?: () => { x: number; y: number };

  constructor(scene: Phaser.Scene, x: number, y: number, hpMul: number) {
    super(scene, x, y, "boss");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(DEPTH.BOSS);
    this.maxHp = Math.round(BOSS.maxHp * hpMul);
    this.hp = this.maxHp;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);

    this.homeX = scene.scale.width - 170;
    audio.play("bossAppear");

    scene.tweens.add({
      targets: this,
      x: this.homeX,
      duration: BOSS.enterDurationMs,
      ease: "Sine.easeOut",
      onComplete: () => {
        this.phase = "fight";
        this.nextActionAt = scene.time.now + 600;
        this.startBob();
      },
    });
  }

  private startBob(): void {
    this.scene.tweens.add({
      targets: this,
      y: { from: this.y - 90, to: this.y + 90 },
      duration: 2600,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });
  }

  get hpRatio(): number {
    return Phaser.Math.Clamp(this.hp / this.maxHp, 0, 1);
  }

  /** Returns true if the boss died from this hit. */
  hit(damage: number): boolean {
    if (!this.alive) return false;
    this.hp -= damage;
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(50, () => {
      if (this.active && this.alive) this.clearTint();
    });
    if (this.hp <= 0) {
      this.alive = false;
      return true;
    }
    return false;
  }

  private fireAimed(speed: number): void {
    if (!this.fireBullet || !this.getPlayerPos) return;
    const p = this.getPlayerPos();
    const angle = Math.atan2(p.y - this.y, p.x - this.x);
    this.fireBullet(this.x - 60, this.y, Math.cos(angle) * speed, Math.sin(angle) * speed);
  }

  private fireFan(count: number, speed: number): void {
    if (!this.fireBullet) return;
    const spread = Phaser.Math.DegToRad(70);
    const start = Math.PI - spread / 2;
    for (let i = 0; i < count; i++) {
      const a = start + (spread * i) / (count - 1);
      this.fireBullet(this.x - 60, this.y, Math.cos(a) * speed, Math.sin(a) * speed);
    }
  }

  private doCharge(): void {
    this.phase = "charge";
    // Telegraph: pulse the accent color and shake before dashing.
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.12,
      scaleY: 0.9,
      duration: 140,
      yoyo: true,
      repeat: 4,
    });
    this.setTint(COLORS.bossAccent);
    this.scene.cameras.main.shake(220, 0.004);

    this.scene.time.delayedCall(950, () => {
      if (!this.active || !this.alive) return;
      this.clearTint();
      this.phase = "dash";
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocityX(-620);
      this.scene.time.delayedCall(620, () => {
        if (!this.active || !this.alive) return;
        body.setVelocityX(0);
        this.scene.tweens.add({
          targets: this,
          x: this.homeX,
          duration: 900,
          ease: "Sine.easeOut",
          onComplete: () => {
            if (this.alive) {
              this.phase = "fight";
              this.nextActionAt = this.scene.time.now + 700;
            }
          },
        });
      });
    });
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    if (this.phase !== "fight" || !this.alive) return;
    if (time < this.nextActionAt) return;

    this.actionCount++;
    // Every fourth action is a dash; otherwise alternate aimed / fan attacks.
    if (this.actionCount % 4 === 0) {
      this.doCharge();
      return;
    }

    const enraged = this.hpRatio < 0.5;
    if (this.actionCount % 2 === 0) {
      this.fireFan(enraged ? 9 : 7, 220);
    } else {
      const shots = enraged ? 3 : 2;
      for (let i = 0; i < shots; i++) {
        this.scene.time.delayedCall(i * 160, () => {
          if (this.active && this.alive) this.fireAimed(260);
        });
      }
    }
    this.nextActionAt = time + (enraged ? 1100 : 1500);
  }
}
