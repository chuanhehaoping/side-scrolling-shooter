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
    // PULSE — bright yellow bolt (tier 1 / overdrive).
    const pulse = this.g();
    pulse.fillStyle(0xffffff, 0.9);
    pulse.fillRoundedRect(0, 1, 18, 6, 3);
    pulse.fillStyle(COLORS.playerBullet, 1);
    pulse.fillRoundedRect(0, 0, 16, 8, 4);
    pulse.fillStyle(0xffffff, 1);
    pulse.fillCircle(13, 4, 2.5);
    pulse.generateTexture("bPulse", 18, 8);
    pulse.destroy();

    // TWIN — slim teal bolt (tier 2 / spread wings / laser flank).
    const twin = this.g();
    twin.fillStyle(0xffffff, 0.85);
    twin.fillRoundedRect(0, 1, 16, 4, 2);
    twin.fillStyle(0x7affd0, 1);
    twin.fillRoundedRect(0, 0.5, 14, 5, 2.5);
    twin.fillStyle(0xffffff, 1);
    twin.fillCircle(11, 3, 2);
    twin.generateTexture("bTwin", 16, 6);
    twin.destroy();

    // PLASMA — glowing orange orb (tier 4, heavy damage).
    const plasma = this.g();
    for (let r = 8; r > 0; r--) {
      plasma.fillStyle(0xff8a3c, 0.14);
      plasma.fillCircle(8, 8, r);
    }
    plasma.fillStyle(0xffce54, 1);
    plasma.fillCircle(8, 8, 5);
    plasma.fillStyle(0xffffff, 1);
    plasma.fillCircle(8, 8, 2.4);
    plasma.generateTexture("bPlasma", 16, 16);
    plasma.destroy();

    // WAVE — violet energy diamond (tier 5, wide spread).
    const wave = this.g();
    wave.fillStyle(0xffffff, 0.35);
    wave.fillEllipse(9, 7, 18, 14);
    wave.fillStyle(0xb07bff, 1);
    wave.fillTriangle(2, 7, 9, 1, 16, 7);
    wave.fillTriangle(2, 7, 9, 13, 16, 7);
    wave.fillStyle(0xffffff, 1);
    wave.fillCircle(9, 7, 2.2);
    wave.generateTexture("bWave", 18, 14);
    wave.destroy();

    // LASER — long piercing magenta lance (tier 6).
    const laser = this.g();
    laser.fillStyle(0xff4fd8, 0.35);
    laser.fillRoundedRect(0, 0, 42, 10, 5);
    laser.fillStyle(0xff4fd8, 1);
    laser.fillRoundedRect(0, 2.5, 42, 5, 2.5);
    laser.fillStyle(0xffffff, 1);
    laser.fillRoundedRect(2, 3.5, 38, 3, 1.5);
    laser.fillCircle(39, 5, 3);
    laser.generateTexture("bLaser", 42, 10);
    laser.destroy();

    // Enemy bullet — hostile red orb.
    const eb = this.g();
    eb.fillStyle(0xffffff, 0.9);
    eb.fillCircle(7, 7, 7);
    eb.fillStyle(COLORS.enemyBullet, 1);
    eb.fillCircle(7, 7, 5);
    eb.fillStyle(0xffffff, 0.85);
    eb.fillCircle(5.5, 5.5, 1.8);
    eb.generateTexture("bulletEnemy", 14, 14);
    eb.destroy();
  }

  private makePlayer(): void {
    const g = this.g();
    const w = 64;
    const h = 46;
    const cy = 23;

    // --- rear engine nozzles ---
    g.fillStyle(0x0d3a63, 1);
    g.fillRoundedRect(0, 15, 14, 7, 3);
    g.fillRoundedRect(0, 24, 14, 7, 3);
    g.fillStyle(COLORS.playerBullet, 1);
    g.fillCircle(3, 18.5, 2.2);
    g.fillCircle(3, 27.5, 2.2);

    // --- swept wings ---
    g.fillStyle(COLORS.playerAccent, 1);
    g.fillTriangle(10, cy, 34, 2, 46, 16);
    g.fillTriangle(10, cy, 34, 44, 46, 30);
    // bright wing edges
    g.fillStyle(COLORS.player, 0.9);
    g.fillTriangle(30, 6, 34, 2, 40, 12);
    g.fillTriangle(30, 40, 34, 44, 40, 34);

    // --- fuselage ---
    g.fillStyle(COLORS.player, 1);
    g.fillTriangle(8, 14, 8, 32, 62, cy);
    g.fillRoundedRect(12, 16, 30, 14, 7);
    // underside shading
    g.fillStyle(0x0d4a7a, 1);
    g.fillTriangle(10, cy, 10, 32, 62, cy);
    g.fillTriangle(12, 25, 44, 25, 42, 30);

    // --- cockpit canopy ---
    g.fillStyle(0x021018, 1);
    g.fillEllipse(34, cy, 16, 9);
    g.fillStyle(0x8fe9ff, 1);
    g.fillEllipse(34, 21, 12, 5);
    g.fillStyle(0xffffff, 1);
    g.fillEllipse(32, 20, 5, 2.4);

    // --- nose & cannon ---
    g.fillStyle(0xbfefff, 1);
    g.fillTriangle(54, 20, 54, 26, 64, cy);
    g.fillStyle(COLORS.playerBullet, 1);
    g.fillRect(60, 22, 4, 2);

    // --- panel highlights / outline ---
    g.lineStyle(1.5, 0xffffff, 0.55);
    g.strokeTriangle(8, 14, 8, 32, 62, cy);
    g.lineStyle(1, 0xffffff, 0.25);
    g.lineBetween(16, 19, 46, 21);

    g.generateTexture("player", w, h);
    g.destroy();
  }

  private makeEnemies(): void {
    this.makeEnemyA();
    this.makeEnemyB();
    this.makeEnemyC();
    this.makeEnemyD();
  }

  // Type A — armored interceptor (flies left, nose to the left).
  private makeEnemyA(): void {
    const a = this.g();
    // dark armor base
    a.fillStyle(0x7a2d12, 1);
    a.fillTriangle(44, 2, 44, 30, 2, 16);
    // body
    a.fillStyle(COLORS.enemyA, 1);
    a.fillTriangle(42, 6, 42, 26, 5, 16);
    // upper / lower wings
    a.fillStyle(0xff9b6b, 1);
    a.fillTriangle(30, 6, 40, 0, 38, 11);
    a.fillTriangle(30, 26, 40, 32, 38, 21);
    // intake prongs (front)
    a.fillStyle(0x7a2d12, 1);
    a.fillTriangle(5, 11, 5, 21, 14, 16);
    // cockpit
    a.fillStyle(0x1a0a05, 1);
    a.fillEllipse(17, 16, 10, 7);
    a.fillStyle(0xffd2b0, 1);
    a.fillEllipse(16, 15, 5, 3);
    // outline + panel line
    a.lineStyle(1.5, 0xffffff, 0.4);
    a.strokeTriangle(42, 6, 42, 26, 5, 16);
    a.lineStyle(1, 0x7a2d12, 0.8);
    a.lineBetween(24, 10, 24, 22);
    a.generateTexture("enemyA", 46, 32);
    a.destroy();
  }

  // Type B — organic weaver with an eye core.
  private makeEnemyB(): void {
    const b = this.g();
    // wings (translucent membranes)
    b.fillStyle(0xc7a0ff, 0.85);
    b.fillTriangle(22, 2, 39, 9, 20, 17);
    b.fillTriangle(22, 34, 39, 27, 20, 19);
    // body
    b.fillStyle(COLORS.enemyB, 1);
    b.fillEllipse(19, 18, 26, 19);
    // front beak (left)
    b.fillTriangle(9, 11, 9, 25, 0, 18);
    // eye
    b.fillStyle(0x1a0033, 1);
    b.fillCircle(15, 18, 6);
    b.fillStyle(0xff5bd0, 1);
    b.fillCircle(14, 18, 3.6);
    b.fillStyle(0xffffff, 1);
    b.fillCircle(12.5, 16.5, 1.4);
    // body sheen
    b.lineStyle(1.2, 0xffffff, 0.3);
    b.strokeCircle(15, 18, 6);
    b.generateTexture("enemyB", 40, 36);
    b.destroy();
  }

  // Type C — heavy gunship with twin barrels.
  private makeEnemyC(): void {
    const c = this.g();
    // hull
    c.fillStyle(0x0c3a1f, 1);
    c.fillRoundedRect(6, 4, 38, 28, 6);
    c.fillStyle(COLORS.enemyC, 1);
    c.fillRoundedRect(8, 6, 34, 24, 5);
    // central armor plate
    c.fillStyle(0x2fae6a, 1);
    c.fillRoundedRect(11, 9, 20, 18, 4);
    // gun barrels (front-left)
    c.fillStyle(0x06301a, 1);
    c.fillRect(0, 11, 10, 4);
    c.fillRect(0, 21, 10, 4);
    // sensor eye
    c.fillStyle(0xffffff, 0.95);
    c.fillCircle(31, 16, 4.2);
    c.fillStyle(0x0c3a1f, 1);
    c.fillCircle(31, 16, 2);
    // rivets
    c.fillStyle(0x06301a, 1);
    c.fillCircle(11, 9, 1.4);
    c.fillCircle(41, 9, 1.4);
    c.fillCircle(11, 27, 1.4);
    c.fillCircle(41, 27, 1.4);
    // outline
    c.lineStyle(1.5, 0xffffff, 0.35);
    c.strokeRoundedRect(8, 6, 34, 24, 5);
    c.generateTexture("enemyC", 46, 36);
    c.destroy();
  }

  // Type D — high-speed dart.
  private makeEnemyD(): void {
    const d = this.g();
    // trailing glow
    d.fillStyle(0xff9be8, 0.5);
    d.fillTriangle(40, 3, 40, 17, 2, 10);
    // body
    d.fillStyle(COLORS.enemyD, 1);
    d.fillTriangle(38, 5, 38, 15, 0, 10);
    // tail fins
    d.fillStyle(0xb0237f, 1);
    d.fillTriangle(33, 1, 40, 2, 36, 8);
    d.fillTriangle(33, 19, 40, 18, 36, 12);
    // highlight stripe
    d.fillStyle(0xffffff, 0.9);
    d.fillRect(18, 9, 16, 2);
    d.fillTriangle(30, 8, 38, 7, 38, 13);
    d.generateTexture("enemyD", 40, 20);
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
