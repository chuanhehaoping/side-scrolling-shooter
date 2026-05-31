import * as Phaser from "phaser";
import { COLORS, GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS } from "../constants";

/**
 * Generates every texture procedurally with Phaser Graphics — the game ships
 * with zero image assets. Once textures exist it hands off to the title scene.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.BOOT);
  }

  create(): void {
    this.makeParticle();
    this.makeFlash();
    this.makeFlame();
    this.makeBullets();
    this.makePlayer();
    this.makeEnemies();
    this.makeBoss();
    this.makeShield();
    this.makeItems();
    this.makeBackgrounds();

    this.scene.start(SCENE_KEYS.TITLE);
  }

  private g(): Phaser.GameObjects.Graphics {
    return this.make.graphics({ x: 0, y: 0 }, false);
  }

  private makeParticle(): void {
    const g = this.g();
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, 8, 8);
    g.generateTexture("particle", 8, 8);
    g.destroy();
  }

  private makeFlash(): void {
    const g = this.g();
    const cx = 32;
    const cy = 32;
    for (let r = 32; r > 0; r -= 2) {
      g.fillStyle(0xffffff, 0.06);
      g.fillCircle(cx, cy, r);
    }
    g.fillStyle(0xffffff, 1);
    g.fillCircle(cx, cy, 6);
    g.generateTexture("flash", 64, 64);
    g.destroy();
  }

  private makeFlame(): void {
    const g = this.g();
    g.fillStyle(0xffffff, 0.9);
    g.fillTriangle(24, 8, 0, 2, 0, 14);
    g.fillStyle(0xffffff, 0.5);
    g.fillTriangle(18, 8, 0, 4, 0, 12);
    g.generateTexture("flame", 24, 16);
    g.destroy();
  }

  private makeBullets(): void {
    const pb = this.g();
    pb.fillStyle(0xffffff, 1);
    pb.fillRoundedRect(0, 1, 18, 6, 3);
    pb.fillStyle(COLORS.playerBullet, 1);
    pb.fillRoundedRect(0, 0, 16, 8, 4);
    pb.fillStyle(0xffffff, 1);
    pb.fillCircle(13, 4, 2.5);
    pb.generateTexture("bulletPlayer", 18, 8);
    pb.destroy();

    const eb = this.g();
    eb.fillStyle(0xffffff, 0.9);
    eb.fillCircle(7, 7, 7);
    eb.fillStyle(COLORS.enemyBullet, 1);
    eb.fillCircle(7, 7, 5);
    eb.generateTexture("bulletEnemy", 14, 14);
    eb.destroy();
  }

  private makePlayer(): void {
    const g = this.g();
    const w = 52;
    const h = 38;
    // Wings
    g.fillStyle(COLORS.playerAccent, 1);
    g.fillTriangle(10, 19, 26, 2, 34, 16);
    g.fillTriangle(10, 19, 26, 36, 34, 22);
    // Fuselage
    g.fillStyle(COLORS.player, 1);
    g.fillTriangle(6, 11, 6, 27, 50, 19);
    // Engine block
    g.fillStyle(COLORS.playerAccent, 1);
    g.fillRoundedRect(2, 14, 12, 10, 3);
    // Cockpit
    g.fillStyle(0xffffff, 1);
    g.fillCircle(30, 19, 4);
    g.fillStyle(COLORS.playerAccent, 1);
    g.fillCircle(30, 19, 2);
    // Outline accents
    g.lineStyle(1.5, 0xffffff, 0.6);
    g.strokeTriangle(6, 11, 6, 27, 50, 19);
    g.generateTexture("player", w, h);
    g.destroy();
  }

  private makeEnemies(): void {
    // Type A — chunky interceptor (points left)
    const a = this.g();
    a.fillStyle(COLORS.enemyA, 1);
    a.fillTriangle(34, 4, 34, 24, 2, 14);
    a.fillStyle(0xffffff, 0.85);
    a.fillCircle(22, 14, 3);
    a.lineStyle(1.5, 0xffffff, 0.4);
    a.strokeTriangle(34, 4, 34, 24, 2, 14);
    a.generateTexture("enemyA", 36, 28);
    a.destroy();

    // Type B — winged weaver
    const b = this.g();
    b.fillStyle(COLORS.enemyB, 1);
    b.fillRoundedRect(8, 8, 24, 14, 5);
    b.fillTriangle(8, 4, 8, 26, 0, 15);
    b.fillStyle(0xffffff, 0.5);
    b.fillTriangle(20, 0, 32, 8, 18, 10);
    b.fillTriangle(20, 30, 32, 22, 18, 20);
    b.fillStyle(0xffffff, 0.9);
    b.fillCircle(18, 15, 3);
    b.generateTexture("enemyB", 34, 30);
    b.destroy();

    // Type C — gunship
    const c = this.g();
    c.fillStyle(COLORS.enemyC, 1);
    c.fillRoundedRect(6, 6, 28, 20, 5);
    c.fillStyle(0x0a3d20, 1);
    c.fillRect(0, 13, 8, 6);
    c.fillStyle(0xffffff, 0.9);
    c.fillCircle(22, 16, 3.5);
    c.lineStyle(1.5, 0xffffff, 0.4);
    c.strokeRoundedRect(6, 6, 28, 20, 5);
    c.generateTexture("enemyC", 38, 32);
    c.destroy();

    // Type D — fast dart
    const d = this.g();
    d.fillStyle(COLORS.enemyD, 1);
    d.fillTriangle(30, 2, 30, 16, 0, 9);
    d.fillStyle(0xffffff, 0.8);
    d.fillRect(18, 7, 10, 4);
    d.generateTexture("enemyD", 30, 18);
    d.destroy();
  }

  private makeBoss(): void {
    const g = this.g();
    const w = 160;
    const h = 140;
    // Hull
    g.fillStyle(COLORS.boss, 1);
    g.fillRoundedRect(30, 20, 110, 100, 18);
    g.fillTriangle(30, 30, 30, 110, 0, 70);
    // Side cannons
    g.fillStyle(COLORS.bossAccent, 1);
    g.fillRoundedRect(20, 18, 24, 28, 6);
    g.fillRoundedRect(20, 94, 24, 28, 6);
    g.fillRect(0, 26, 22, 12);
    g.fillRect(0, 102, 22, 12);
    // Core
    g.fillStyle(0x000000, 0.5);
    g.fillCircle(90, 70, 30);
    g.fillStyle(COLORS.bossAccent, 1);
    g.fillCircle(90, 70, 20);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(90, 70, 9);
    // Plating
    g.lineStyle(2, 0x000000, 0.35);
    g.strokeRoundedRect(30, 20, 110, 100, 18);
    g.generateTexture("boss", w, h);
    g.destroy();
  }

  private makeShield(): void {
    const g = this.g();
    g.lineStyle(3, COLORS.shield, 0.9);
    g.strokeCircle(34, 34, 30);
    g.lineStyle(1.5, 0xffffff, 0.6);
    g.strokeCircle(34, 34, 24);
    g.generateTexture("shield", 68, 68);
    g.destroy();
  }

  private makeItems(): void {
    const defs: { key: string; color: number; glyph: (g: Phaser.GameObjects.Graphics) => void }[] = [
      {
        key: "item-heal",
        color: COLORS.itemHeal,
        glyph: (g) => {
          g.fillStyle(0xffffff, 1);
          g.fillRect(10, 6, 4, 12);
          g.fillRect(6, 10, 12, 4);
        },
      },
      {
        key: "item-score",
        color: COLORS.itemScore,
        glyph: (g) => {
          g.fillStyle(0xffffff, 1);
          // Four-point star drawn as two overlapping triangles.
          g.fillTriangle(12, 3, 8, 13, 16, 13);
          g.fillTriangle(12, 21, 8, 11, 16, 11);
        },
      },
      {
        key: "item-rapid",
        color: COLORS.itemRapid,
        glyph: (g) => {
          g.fillStyle(0xffffff, 1);
          g.fillTriangle(7, 6, 7, 18, 14, 12);
          g.fillTriangle(12, 6, 12, 18, 19, 12);
        },
      },
      {
        key: "item-power",
        color: COLORS.itemPower,
        glyph: (g) => {
          g.fillStyle(0xffffff, 1);
          g.fillRect(11, 4, 2, 16);
          g.fillRect(6, 9, 2, 11);
          g.fillRect(16, 9, 2, 11);
        },
      },
      {
        key: "item-shield",
        color: COLORS.itemShield,
        glyph: (g) => {
          g.fillStyle(0xffffff, 1);
          g.fillTriangle(12, 5, 5, 9, 12, 20);
          g.fillTriangle(12, 5, 19, 9, 12, 20);
        },
      },
    ];

    for (const def of defs) {
      const g = this.g();
      g.fillStyle(def.color, 1);
      g.fillRoundedRect(2, 2, 20, 20, 6);
      g.fillStyle(0x000000, 0.25);
      g.fillRoundedRect(2, 2, 20, 20, 6);
      g.fillStyle(def.color, 0.9);
      g.fillRoundedRect(3, 3, 18, 18, 5);
      def.glyph(g);
      g.lineStyle(1.5, 0xffffff, 0.7);
      g.strokeRoundedRect(2, 2, 20, 20, 6);
      g.generateTexture(def.key, 24, 24);
      g.destroy();
    }
  }

  private makeBackgrounds(): void {
    // Far layer: deep gradient + faint stars
    const far = this.g();
    far.fillGradientStyle(0x050a1f, 0x070425, 0x02040d, 0x0a0820, 1);
    far.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    for (let i = 0; i < 90; i++) {
      const x = Phaser.Math.Between(2, GAME_WIDTH - 2);
      const y = Phaser.Math.Between(2, GAME_HEIGHT - 2);
      far.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.15, 0.4));
      far.fillCircle(x, y, Phaser.Math.FloatBetween(0.5, 1.2));
    }
    // Nebula blobs
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(0, GAME_HEIGHT);
      const color = Phaser.Math.Between(0, 1) ? 0x1b2a6b : 0x3a1b5e;
      far.fillStyle(color, 0.12);
      far.fillCircle(x, y, Phaser.Math.Between(60, 130));
    }
    far.generateTexture("bg-far", GAME_WIDTH, GAME_HEIGHT);
    far.destroy();

    // Mid layer: medium stars (transparent base)
    const mid = this.g();
    for (let i = 0; i < 70; i++) {
      const x = Phaser.Math.Between(2, GAME_WIDTH - 2);
      const y = Phaser.Math.Between(2, GAME_HEIGHT - 2);
      mid.fillStyle(Phaser.Math.Between(0, 1) ? 0x9fd8ff : 0xffffff, Phaser.Math.FloatBetween(0.3, 0.7));
      mid.fillCircle(x, y, Phaser.Math.FloatBetween(0.8, 1.6));
    }
    mid.generateTexture("bg-mid", GAME_WIDTH, GAME_HEIGHT);
    mid.destroy();

    // Near layer: bright streaks / dust particles
    const near = this.g();
    for (let i = 0; i < 45; i++) {
      const x = Phaser.Math.Between(2, GAME_WIDTH - 6);
      const y = Phaser.Math.Between(2, GAME_HEIGHT - 2);
      near.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.5, 0.95));
      const len = Phaser.Math.Between(2, 6);
      near.fillRect(x, y, len, Phaser.Math.FloatBetween(1, 2));
    }
    near.generateTexture("bg-near", GAME_WIDTH, GAME_HEIGHT);
    near.destroy();
  }
}
