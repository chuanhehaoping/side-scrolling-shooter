import * as Phaser from "phaser";
import { OVERDRIVE_SHOTS, PLAYER, POWERUP, WEAPONS } from "../config";
import { COLORS, DEPTH } from "../constants";
import type { InputState } from "../types";
import { audio } from "../audio";

/** One projectile request emitted by the player toward the scene. */
export interface PlayerShot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  damage: number;
  texture: string;
  pierce: number;
}

export type FireFn = (shot: PlayerShot) => void;

/**
 * Player fighter. Handles movement, tilt, engine flame, the evolving weapon
 * system (laser tiers unlocked by score + temporary overdrive), shield, and
 * invulnerability frames.
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  maxHp: number;
  hp: number;

  private invulnUntil = 0;
  private nextFireAt = 0;
  private rapidUntil = 0;
  private powerUntil = 0;
  private shieldActive = false;
  private weaponIndex = 0;

  private flame: Phaser.GameObjects.Sprite;
  private shieldRing: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, x: number, y: number, maxHp: number) {
    super(scene, x, y, "player");
    this.maxHp = maxHp;
    this.hp = maxHp;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(DEPTH.PLAYER);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(PLAYER.hitboxRadius, this.width / 2 - PLAYER.hitboxRadius, this.height / 2 - PLAYER.hitboxRadius);
    body.setCollideWorldBounds(true);

    this.flame = scene.add.sprite(x, y, "flame");
    this.flame.setDepth(DEPTH.PLAYER - 1);
    this.flame.setBlendMode(Phaser.BlendModes.ADD);
    this.flame.setOrigin(1, 0.5);

    this.shieldRing = scene.add.sprite(x, y, "shield");
    this.shieldRing.setDepth(DEPTH.PLAYER + 1);
    this.shieldRing.setBlendMode(Phaser.BlendModes.ADD);
    this.shieldRing.setVisible(false);
  }

  get isInvulnerable(): boolean {
    return this.scene.time.now < this.invulnUntil;
  }

  get hasShield(): boolean {
    return this.shieldActive;
  }

  get powerTimeLeft(): number {
    return Math.max(0, (this.powerUntil - this.scene.time.now) / 1000);
  }

  get rapidTimeLeft(): number {
    return Math.max(0, (this.rapidUntil - this.scene.time.now) / 1000);
  }

  /** 0-based index of the currently unlocked weapon tier. */
  get weaponLevel(): number {
    return this.weaponIndex;
  }

  /**
   * Promotes the weapon to the highest tier the score has unlocked.
   * Returns the new tier name when an upgrade happened, otherwise null.
   */
  upgradeWeaponForScore(score: number): string | null {
    let idx = 0;
    for (let i = 0; i < WEAPONS.length; i++) {
      if (score >= WEAPONS[i].threshold) idx = i;
    }
    if (idx > this.weaponIndex) {
      this.weaponIndex = idx;
      return WEAPONS[idx].name;
    }
    return null;
  }

  handleMovement(input: InputState): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const speed = input.slow ? PLAYER.slowSpeed : PLAYER.baseSpeed;

    let vx = 0;
    let vy = 0;
    if (input.left) vx -= 1;
    if (input.right) vx += 1;
    if (input.up) vy -= 1;
    if (input.down) vy += 1;

    const len = Math.hypot(vx, vy) || 1;
    body.setVelocity((vx / len) * speed, (vy / len) * speed);

    // Tilt toward vertical movement for a sense of weight.
    const targetTilt = vy * PLAYER.maxTilt;
    this.setRotation(Phaser.Math.Linear(this.rotation, targetTilt, 0.2));
  }

  tryFire(fire: FireFn): void {
    const now = this.scene.time.now;
    if (now < this.nextFireAt) return;

    const tier = WEAPONS[this.weaponIndex];
    const rapid = now < this.rapidUntil;
    this.nextFireAt = now + (rapid ? tier.rapidCooldownMs : tier.cooldownMs);

    const muzzleX = this.x + this.width / 2 - 6;
    const power = now < this.powerUntil;
    const shots = power ? [...tier.shots, ...OVERDRIVE_SHOTS] : tier.shots;

    for (const s of shots) {
      const a = Phaser.Math.DegToRad(s.angleDeg);
      fire({
        x: muzzleX,
        y: this.y + s.yOffset,
        vx: Math.cos(a) * s.speed,
        vy: Math.sin(a) * s.speed,
        angle: a,
        damage: s.damage,
        texture: s.texture,
        pierce: s.pierce,
      });
    }
    audio.play("shot");
  }

  /** Returns true if the player actually took a hit (was vulnerable). */
  takeDamage(amount: number): boolean {
    if (this.isInvulnerable) return false;

    if (this.shieldActive) {
      this.shieldActive = false;
      this.shieldRing.setVisible(false);
      this.invulnUntil = this.scene.time.now + 600;
      audio.play("enemyHit");
      return false;
    }

    this.hp = Math.max(0, this.hp - amount);
    this.invulnUntil = this.scene.time.now + PLAYER.invulnMsOnHit;
    audio.play("playerHit");
    this.startBlink();
    return true;
  }

  private startBlink(): void {
    this.scene.tweens.add({
      targets: this,
      alpha: { from: 0.25, to: 1 },
      duration: 140,
      repeat: Math.floor(PLAYER.invulnMsOnHit / 280),
      yoyo: true,
      onComplete: () => this.setAlpha(1),
    });
  }

  applyHeal(amount: number): void {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  applyRapid(): void {
    this.rapidUntil = Math.max(this.scene.time.now, this.rapidUntil) + POWERUP.rapidDurationMs;
  }

  applyPower(): void {
    this.powerUntil = Math.max(this.scene.time.now, this.powerUntil) + POWERUP.powerDurationMs;
  }

  applyShield(): void {
    this.shieldActive = true;
    this.shieldRing.setVisible(true);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    // Engine flame flicker positioned behind the ship.
    const flicker = 0.85 + Math.random() * 0.4;
    this.flame.setPosition(this.x - this.width / 2 + 2, this.y);
    this.flame.setRotation(this.rotation);
    this.flame.setScale(flicker, 0.7 + Math.random() * 0.3);
    this.flame.setTint(Phaser.Math.Between(0, 1) ? COLORS.player : COLORS.playerBullet);

    this.shieldRing.setPosition(this.x, this.y);
    if (this.shieldActive) {
      this.shieldRing.setRotation(time * 0.003);
      this.shieldRing.setAlpha(0.5 + Math.sin(time * 0.01) * 0.2);
    }
  }

  destroy(fromScene?: boolean): void {
    this.flame?.destroy();
    this.shieldRing?.destroy();
    super.destroy(fromScene);
  }
}
