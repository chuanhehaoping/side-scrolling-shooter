import * as Phaser from "phaser";
import { COLORS, DEPTH, GAME_HEIGHT, GAME_WIDTH } from "../constants";

/**
 * Visual flourishes: multi-layer parallax starfield, explosions, muzzle flashes
 * and floating score popups. Pure presentation — no gameplay state.
 *
 * PERFORMANCE: a single long-lived particle emitter and a recycled pool of
 * flash sprites are reused for every burst. Creating/destroying a
 * ParticleEmitter (or sprite) per hit caused frame collapse during boss fights
 * where many bullets connect each frame, so everything here is pooled.
 */
export class EffectsSystem {
  private scene: Phaser.Scene;
  private layers: { sprite: Phaser.GameObjects.TileSprite; speed: number }[] = [];
  private burst!: Phaser.GameObjects.Particles.ParticleEmitter;
  private flashPool: Phaser.GameObjects.Sprite[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.initEmitter();
  }

  private initEmitter(): void {
    // One reusable emitter; bursts are produced via emitParticleAt().
    this.burst = this.scene.add.particles(0, 0, "particle", {
      speed: { min: 60, max: 240 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.9, end: 0 },
      lifespan: { min: 250, max: 560 },
      blendMode: "ADD",
      emitting: false,
    });
    this.burst.setDepth(DEPTH.EFFECTS);
  }

  /** Borrow a flash sprite from the pool (creates one only when needed). */
  private getFlash(): Phaser.GameObjects.Sprite {
    for (const s of this.flashPool) {
      if (!s.active) {
        s.setActive(true).setVisible(true);
        return s;
      }
    }
    const sprite = this.scene.add
      .sprite(0, 0, "flash")
      .setDepth(DEPTH.EFFECTS)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.flashPool.push(sprite);
    return sprite;
  }

  private releaseFlash(sprite: Phaser.GameObjects.Sprite): void {
    sprite.setActive(false).setVisible(false);
    sprite.setScale(1).setAlpha(1).setRotation(0);
  }

  private ring(x: number, y: number, color: number, fromScale: number, toScale: number, duration: number): void {
    const ring = this.getFlash();
    ring.setPosition(x, y).setTint(color).setScale(fromScale).setAlpha(0.85);
    this.scene.tweens.add({
      targets: ring,
      scale: { from: fromScale, to: toScale },
      alpha: { from: 0.85, to: 0 },
      duration,
      ease: "Sine.easeOut",
      onComplete: () => this.releaseFlash(ring),
    });
  }

  createParallax(): void {
    const far = this.scene.add
      .tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, "bg-far")
      .setOrigin(0, 0)
      .setDepth(DEPTH.BG_FAR);
    const mid = this.scene.add
      .tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, "bg-mid")
      .setOrigin(0, 0)
      .setDepth(DEPTH.BG_MID);
    const near = this.scene.add
      .tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, "bg-near")
      .setOrigin(0, 0)
      .setDepth(DEPTH.BG_NEAR);

    this.layers = [
      { sprite: far, speed: 0.4 },
      { sprite: mid, speed: 1.1 },
      { sprite: near, speed: 2.4 },
    ];
  }

  updateParallax(delta: number): void {
    const dt = delta / 16.6667;
    for (const layer of this.layers) {
      layer.sprite.tilePositionX += layer.speed * dt;
    }
  }

  muzzleFlash(x: number, y: number): void {
    const flash = this.getFlash();
    flash.setPosition(x, y).setTint(COLORS.playerBullet).setScale(0.6).setAlpha(0.9);
    this.scene.tweens.add({
      targets: flash,
      scale: { from: 0.6, to: 1.3 },
      alpha: { from: 0.9, to: 0 },
      duration: 110,
      onComplete: () => this.releaseFlash(flash),
    });
  }

  explosion(x: number, y: number, color: number, scale = 1): void {
    this.burst.setParticleTint(color);
    this.burst.emitParticleAt(x, y, Math.round(14 * scale));
    this.ring(x, y, color, 0.4 * scale, 2.2 * scale, 320);
  }

  bigExplosion(x: number, y: number): void {
    for (let i = 0; i < 6; i++) {
      this.scene.time.delayedCall(i * 110, () => {
        this.explosion(
          x + Phaser.Math.Between(-70, 70),
          y + Phaser.Math.Between(-50, 50),
          i % 2 === 0 ? COLORS.boss : COLORS.bossAccent,
          1.6,
        );
      });
    }
    this.scene.cameras.main.shake(600, 0.012);
  }

  /** Celebratory burst when the weapon evolves to a new tier. */
  weaponUpgradeBurst(x: number, y: number, color: number): void {
    this.burst.setParticleTint(color);
    this.burst.emitParticleAt(x, y, 26);
    this.ring(x, y, color, 0.5, 3, 420);
    this.ring(x, y, 0xffffff, 0.5, 4, 540);
  }

  scorePopup(x: number, y: number, text: string, color = "#ffce54"): void {
    const label = this.scene.add
      .text(x, y, text, {
        fontFamily: "monospace",
        fontSize: "16px",
        color,
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.EFFECTS);
    this.scene.tweens.add({
      targets: label,
      y: y - 36,
      alpha: { from: 1, to: 0 },
      duration: 700,
      onComplete: () => label.destroy(),
    });
  }
}
