import * as Phaser from "phaser";
import { COLORS, DEPTH, GAME_HEIGHT, GAME_WIDTH } from "../constants";

/**
 * Visual flourishes: multi-layer parallax starfield, explosions, muzzle flashes
 * and floating score popups. Pure presentation — no gameplay state.
 */
export class EffectsSystem {
  private scene: Phaser.Scene;
  private layers: { sprite: Phaser.GameObjects.TileSprite; speed: number }[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
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
    const flash = this.scene.add
      .sprite(x, y, "flash")
      .setDepth(DEPTH.EFFECTS)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(COLORS.playerBullet);
    this.scene.tweens.add({
      targets: flash,
      scale: { from: 0.6, to: 1.4 },
      alpha: { from: 0.9, to: 0 },
      duration: 120,
      onComplete: () => flash.destroy(),
    });
  }

  explosion(x: number, y: number, color: number, scale = 1): void {
    const emitter = this.scene.add.particles(x, y, "particle", {
      speed: { min: 60 * scale, max: 220 * scale },
      angle: { min: 0, max: 360 },
      scale: { start: 0.9 * scale, end: 0 },
      lifespan: { min: 250, max: 550 },
      quantity: Math.round(14 * scale),
      tint: [color, 0xffffff, COLORS.playerBullet],
      blendMode: "ADD",
      emitting: false,
    });
    emitter.setDepth(DEPTH.EFFECTS);
    emitter.explode(Math.round(16 * scale));

    const ring = this.scene.add
      .sprite(x, y, "flash")
      .setDepth(DEPTH.EFFECTS)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(color);
    this.scene.tweens.add({
      targets: ring,
      scale: { from: 0.4 * scale, to: 2.2 * scale },
      alpha: { from: 0.8, to: 0 },
      duration: 320,
      onComplete: () => ring.destroy(),
    });

    this.scene.time.delayedCall(700, () => emitter.destroy());
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
