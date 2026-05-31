import * as Phaser from "phaser";
import { COLORS, DEPTH, EVENTS, SCENE_KEYS } from "../constants";
import { BOSS, DIFFICULTIES, HUD_THROTTLE_MS, ITEM, WEAPONS } from "../config";
import type {
  Difficulty,
  DifficultyConfig,
  HudSnapshot,
  InputState,
  ItemType,
} from "../types";
import { bus } from "../eventBus";
import { audio } from "../audio";
import { getHighScore, saveHighScore } from "../storage";
import { Player } from "../entities/Player";
import type { PlayerShot } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { Boss } from "../entities/Boss";
import { Bullet } from "../entities/Bullet";
import { Item } from "../entities/Item";
import { EffectsSystem } from "../systems/EffectsSystem";
import { DifficultySystem } from "../systems/DifficultySystem";
import { EnemySpawner } from "../systems/EnemySpawner";
import { CollisionSystem } from "../systems/CollisionSystem";

/** Per-enemy-type explosion tint so each kill reads with its own colour. */
const ENEMY_FX_COLOR: Record<string, number> = {
  A: COLORS.enemyA,
  B: COLORS.enemyB,
  C: COLORS.enemyC,
  D: COLORS.enemyD,
};

const NO_INPUT: InputState = {
  up: false,
  down: false,
  left: false,
  right: false,
  fire: false,
  slow: false,
};

/**
 * The core gameplay scene. Owns all entities, systems and the run lifecycle.
 * The Phaser loop drives everything; React only receives throttled snapshots.
 */
export class GameScene extends Phaser.Scene {
  private difficulty: Difficulty = "normal";
  private config!: DifficultyConfig;

  private player!: Player;
  private playerBullets!: Phaser.Physics.Arcade.Group;
  private enemyBullets!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private items!: Phaser.Physics.Arcade.Group;

  private effects!: EffectsSystem;
  private difficultySys!: DifficultySystem;
  private spawner!: EnemySpawner;
  private collisions!: CollisionSystem;

  private boss: Boss | null = null;
  private bossActive = false;
  private nextBossScore = 0;

  private score = 0;
  private highScore = 0;
  private startingHighScore = 0;
  private gameEnded = false;

  private mobileInput: InputState = { ...NO_INPUT };
  private lastHudPush = 0;
  /** Throttles cosmetic hit feedback (FX + sfx) during rapid multi-hits. */
  private lastHitSfxAt = 0;
  private lastBossFxAt = 0;

  private keys!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    w: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
    space: Phaser.Input.Keyboard.Key;
    shift: Phaser.Input.Keyboard.Key;
  };

  constructor() {
    super(SCENE_KEYS.GAME);
  }

  create(data: { difficulty?: Difficulty }): void {
    this.difficulty = data.difficulty ?? "normal";
    this.config = DIFFICULTIES[this.difficulty];

    this.score = 0;
    this.gameEnded = false;
    this.bossActive = false;
    this.boss = null;
    this.nextBossScore = this.config.bossScore;
    this.highScore = getHighScore();
    this.startingHighScore = this.highScore;
    this.mobileInput = { ...NO_INPUT };

    const { width, height } = this.scale;
    this.physics.world.setBounds(0, 0, width, height);

    this.effects = new EffectsSystem(this);
    this.effects.createParallax();

    this.playerBullets = this.physics.add.group();
    this.enemyBullets = this.physics.add.group();
    this.enemies = this.physics.add.group();
    this.items = this.physics.add.group();

    this.player = new Player(this, 130, height / 2, this.config.playerHp);

    this.difficultySys = new DifficultySystem(this.config);
    this.difficultySys.start(this.time.now);

    this.spawner = new EnemySpawner(this, this.difficultySys, () => this.spawnEnemyEntity());
    this.spawner.setEnabled(true);

    this.collisions = new CollisionSystem(this, {
      onBulletHitEnemy: this.handleBulletHitEnemy,
      onBulletHitBoss: this.handleBulletHitBoss,
      onPlayerHitByBullet: this.handlePlayerHitByBullet,
      onPlayerHitByEnemy: this.handlePlayerHitByEnemy,
      onPlayerHitByBoss: this.handlePlayerHitByBoss,
      onItemCollected: this.handleItemCollected,
    });
    this.collisions.register({
      player: this.player,
      playerBullets: this.playerBullets,
      enemyBullets: this.enemyBullets,
      enemies: this.enemies,
      items: this.items,
    });

    this.setupInput();
    this.setupBus();

    bus.emit(EVENTS.SCENE_STATE, "playing");
    this.pushHud(true);
  }

  // ---------------------------------------------------------------- input ---

  private setupInput(): void {
    const kb = this.input.keyboard;
    if (!kb) return;
    const K = Phaser.Input.Keyboard.KeyCodes;
    this.keys = {
      up: kb.addKey(K.UP),
      down: kb.addKey(K.DOWN),
      left: kb.addKey(K.LEFT),
      right: kb.addKey(K.RIGHT),
      w: kb.addKey(K.W),
      a: kb.addKey(K.A),
      s: kb.addKey(K.S),
      d: kb.addKey(K.D),
      space: kb.addKey(K.SPACE),
      shift: kb.addKey(K.SHIFT),
    };
    kb.addCapture("SPACE,UP,DOWN,LEFT,RIGHT,W,A,S,D,SHIFT");
  }

  private readInput(): InputState {
    const m = this.mobileInput;
    if (!this.keys) return { ...m };
    const k = this.keys;
    return {
      up: k.up.isDown || k.w.isDown || m.up,
      down: k.down.isDown || k.s.isDown || m.down,
      left: k.left.isDown || k.a.isDown || m.left,
      right: k.right.isDown || k.d.isDown || m.right,
      fire: k.space.isDown || m.fire,
      slow: k.shift.isDown || m.slow,
    };
  }

  private setupBus(): void {
    bus.on(EVENTS.INPUT_STATE, this.onMobileInput, this);
    bus.on(EVENTS.TOGGLE_PAUSE, this.togglePause, this);
    bus.on(EVENTS.REQUEST_RESTART, this.onRequestRestart, this);
    bus.on(EVENTS.REQUEST_TITLE, this.onRequestTitle, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      bus.off(EVENTS.INPUT_STATE, this.onMobileInput, this);
      bus.off(EVENTS.TOGGLE_PAUSE, this.togglePause, this);
      bus.off(EVENTS.REQUEST_RESTART, this.onRequestRestart, this);
      bus.off(EVENTS.REQUEST_TITLE, this.onRequestTitle, this);
    });
  }

  private onMobileInput = (state: InputState) => {
    this.mobileInput = state;
  };

  private onRequestRestart = () => {
    if (this.scene.isPaused()) this.scene.resume();
    this.scene.restart({ difficulty: this.difficulty });
  };

  private onRequestTitle = () => {
    if (this.scene.isPaused()) this.scene.resume();
    this.scene.start(SCENE_KEYS.TITLE);
  };

  private togglePause = () => {
    if (this.gameEnded) return;
    if (this.scene.isPaused()) {
      this.scene.resume();
      bus.emit(EVENTS.SCENE_STATE, this.bossActive ? "boss" : "playing");
    } else {
      this.scene.pause();
      bus.emit(EVENTS.SCENE_STATE, "paused");
    }
  };

  // -------------------------------------------------------------- spawning ---

  private acquireBullet(
    group: Phaser.Physics.Arcade.Group,
    texture: string,
    depth: number,
  ): Bullet {
    const existing = group.getFirstDead(false) as Bullet | null;
    const bullet = existing ?? this.createPooledBullet(group, texture, depth);
    bullet.setTexture(texture);
    return bullet;
  }

  private createPooledBullet(
    group: Phaser.Physics.Arcade.Group,
    texture: string,
    depth: number,
  ): Bullet {
    const bullet = new Bullet(this, texture);
    this.add.existing(bullet);
    group.add(bullet);
    bullet.setDepth(depth);
    return bullet;
  }

  private firePlayerBullet = (shot: PlayerShot) => {
    const bullet = this.acquireBullet(this.playerBullets, shot.texture, DEPTH.PLAYER_BULLETS);
    bullet.fire(shot.x, shot.y, shot.vx, shot.vy, shot.damage, shot.angle, shot.pierce);
    this.effects.muzzleFlash(shot.x, shot.y);
  };

  private fireEnemyBullet(x: number, y: number, vx: number, vy: number): void {
    const bullet = this.acquireBullet(this.enemyBullets, "bulletEnemy", DEPTH.ENEMY_BULLETS);
    bullet.fire(x, y, vx, vy, 1);
  }

  private enemyFire = (enemy: Enemy) => {
    const speed = 230 * this.difficultySys.getSpeedMul();
    const angle = Math.atan2(this.player.y - enemy.y, this.player.x - enemy.x);
    this.fireEnemyBullet(enemy.x - 18, enemy.y, Math.cos(angle) * speed, Math.sin(angle) * speed);
  };

  private spawnEnemyEntity(): Enemy | null {
    if (this.bossActive) return null;
    const type = this.difficultySys.pickEnemyType();
    let enemy = this.enemies.getFirstDead(false) as Enemy | null;
    if (!enemy) {
      enemy = new Enemy(this);
      this.add.existing(enemy);
      this.enemies.add(enemy);
      enemy.setDepth(DEPTH.ENEMIES);
      enemy.onFire = this.enemyFire;
    }
    enemy.spawn(
      type,
      this.scale.width + 50,
      EnemySpawner.randomY(),
      this.difficultySys.getSpeedMul(),
      this.difficultySys.getFireRateMul(),
    );
    return enemy;
  }

  private spawnItem(x: number, y: number): void {
    const type = this.pickItemType();
    let item = this.items.getFirstDead(false) as Item | null;
    if (!item) {
      item = new Item(this);
      this.add.existing(item);
      this.items.add(item);
      item.setDepth(DEPTH.ITEMS);
    }
    item.spawn(type, x, y);
  }

  private pickItemType(): ItemType {
    const roll = Phaser.Math.FloatBetween(0, 1);
    if (roll < 0.28) return "score";
    if (roll < 0.5) return "heal";
    if (roll < 0.7) return "rapid";
    if (roll < 0.88) return "power";
    return "shield";
  }

  // ----------------------------------------------------------------- boss ---

  private spawnBoss(): void {
    this.bossActive = true;
    this.spawner.setEnabled(false);

    // Clear lingering enemies & enemy bullets for a clean arena.
    this.enemies.children.each((child) => {
      const e = child as Enemy;
      if (e.active) e.deactivate();
      return true;
    });

    const { width, height } = this.scale;
    this.boss = new Boss(this, width + 120, height / 2, this.bossHpMultiplier());
    this.boss.fireBullet = (x, y, vx, vy) => this.fireEnemyBullet(x, y, vx, vy);
    this.boss.getPlayerPos = () => ({ x: this.player.x, y: this.player.y });

    this.collisions.registerBoss({
      player: this.player,
      playerBullets: this.playerBullets,
      boss: this.boss,
    });

    bus.emit(EVENTS.SCENE_STATE, "boss");
  }

  private bossHpMultiplier(): number {
    const tier = Math.max(1, Math.round(this.nextBossScore / this.config.bossScore));
    return 1 + (tier - 1) * 0.4;
  }

  private defeatBoss(): void {
    if (!this.boss) return;
    const bx = this.boss.x;
    const by = this.boss.y;
    this.effects.bigExplosion(bx, by);
    audio.play("bossExplosion");
    this.addScore(BOSS.scoreReward);
    this.effects.scorePopup(bx, by, `+${BOSS.scoreReward}`, "#ffce54");

    this.boss.destroy();
    this.boss = null;
    this.bossActive = false;
    this.nextBossScore = this.score + Math.round(this.config.bossScore * 1.5);
    this.spawner.setEnabled(true);
    bus.emit(EVENTS.SCENE_STATE, "playing");
  }

  // ----------------------------------------------------------- collisions ---

  private handleBulletHitEnemy = (bullet: Bullet, enemy: Enemy) => {
    if (!bullet.active || !enemy.active) return;
    // Skip enemies this (piercing) bullet has already damaged.
    if (!bullet.canDamage(enemy.uid)) return;
    const shouldRemove = bullet.registerHit(enemy.uid);

    const dead = enemy.hit(bullet.damage);
    this.playHitSfx();
    if (dead) {
      this.addScore(enemy.scoreValue);
      this.effects.explosion(enemy.x, enemy.y, ENEMY_FX_COLOR[enemy.enemyType], 1);
      audio.play("explosion");
      if (Phaser.Math.FloatBetween(0, 1) < this.config.itemDropChance) {
        this.spawnItem(enemy.x, enemy.y);
      }
      enemy.deactivate();
    }
    if (shouldRemove) bullet.deactivate();
  };

  /** Plays the light hit blip at most every ~45ms to avoid audio overload. */
  private playHitSfx(): void {
    const now = this.time.now;
    if (now - this.lastHitSfxAt < 45) return;
    this.lastHitSfxAt = now;
    audio.play("enemyHit");
  }

  /** Boss occupies a single logical target id for piercing bullets. */
  private static readonly BOSS_HIT_ID = -1;

  private handleBulletHitBoss = (bullet: Bullet, boss: Boss) => {
    if (!bullet.active || !boss.active) return;
    if (!bullet.canDamage(GameScene.BOSS_HIT_ID)) return;
    const shouldRemove = bullet.registerHit(GameScene.BOSS_HIT_ID);

    this.playHitSfx();
    // Throttle the on-hit sparkle so dense fire doesn't spawn FX every frame.
    const now = this.time.now;
    if (now - this.lastBossFxAt > 55) {
      this.lastBossFxAt = now;
      this.effects.explosion(bullet.x, bullet.y, COLORS.bossAccent, 0.4);
    }
    const dead = boss.hit(bullet.damage);
    if (dead) this.defeatBoss();
    if (shouldRemove) bullet.deactivate();
  };

  private handlePlayerHitByBullet = (bullet: Bullet) => {
    if (!bullet.active) return;
    bullet.deactivate();
    this.damagePlayer(1);
  };

  private handlePlayerHitByEnemy = (enemy: Enemy) => {
    if (!enemy.active) return;
    this.effects.explosion(enemy.x, enemy.y, COLORS.enemyA, 0.8);
    enemy.deactivate();
    this.damagePlayer(1);
  };

  private handlePlayerHitByBoss = (_boss: Boss) => {
    this.damagePlayer(BOSS.contactDamage);
  };

  private handleItemCollected = (item: Item) => {
    if (!item.active) return;
    const type = item.itemType;
    item.deactivate();
    audio.play("item");
    this.applyItem(type);
  };

  private applyItem(type: ItemType): void {
    const px = this.player.x;
    const py = this.player.y - 28;
    switch (type) {
      case "heal":
        this.player.applyHeal(1);
        this.effects.scorePopup(px, py, "+HP", "#4ee08a");
        break;
      case "score":
        this.addScore(ITEM.scoreBonus);
        this.effects.scorePopup(px, py, `+${ITEM.scoreBonus}`, "#ffce54");
        break;
      case "rapid":
        this.player.applyRapid();
        this.effects.scorePopup(px, py, "RAPID", "#5ef2ff");
        break;
      case "power":
        this.player.applyPower();
        this.effects.scorePopup(px, py, "OVERDRIVE", "#ff4fd8");
        break;
      case "shield":
        this.player.applyShield();
        this.effects.scorePopup(px, py, "SHIELD", "#9d6bff");
        break;
    }
  }

  private damagePlayer(amount: number): void {
    if (this.gameEnded) return;
    const took = this.player.takeDamage(amount);
    if (took) {
      this.effects.explosion(this.player.x, this.player.y, COLORS.player, 0.7);
      if (this.player.hp <= 0) this.endGame();
    }
  }

  private addScore(amount: number): void {
    this.score += amount;
    if (this.score > this.highScore) this.highScore = this.score;
    this.checkWeaponUpgrade();
  }

  private checkWeaponUpgrade(): void {
    const upgraded = this.player.upgradeWeaponForScore(this.score);
    if (!upgraded) return;
    const tier = WEAPONS[this.player.weaponLevel];
    audio.play("item");
    this.effects.scorePopup(this.player.x, this.player.y - 40, `▲ ${upgraded}`, tier.color);
    this.effects.weaponUpgradeBurst(this.player.x, this.player.y, Phaser.Display.Color.HexStringToColor(tier.color).color);
  }

  /** Weapon HUD fields derived from the player's current tier and score. */
  private weaponHud(): {
    name: string;
    level: number;
    max: number;
    progress: number;
    color: string;
  } {
    const idx = this.player.weaponLevel;
    const tier = WEAPONS[idx];
    const next = WEAPONS[idx + 1];
    let progress = 1;
    if (next) {
      const span = next.threshold - tier.threshold;
      progress = span > 0 ? Phaser.Math.Clamp((this.score - tier.threshold) / span, 0, 1) : 1;
    }
    return {
      name: tier.name,
      level: idx + 1,
      max: WEAPONS.length,
      progress,
      color: tier.color,
    };
  }

  // ------------------------------------------------------------ lifecycle ---

  private endGame(): void {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.spawner.setEnabled(false);

    this.effects.explosion(this.player.x, this.player.y, COLORS.player, 1.6);
    this.effects.bigExplosion(this.player.x, this.player.y);
    this.player.setVisible(false);
    (this.player.body as Phaser.Physics.Arcade.Body).enable = false;
    audio.play("gameOver");

    const finalHigh = saveHighScore(this.score);
    this.highScore = finalHigh;
    const isNewHighScore = this.score > this.startingHighScore && this.score > 0;

    this.pushHud(true);

    this.time.delayedCall(950, () => {
      this.scene.start(SCENE_KEYS.GAME_OVER, {
        score: this.score,
        highScore: finalHigh,
        isNewHighScore,
        difficulty: this.difficulty,
      });
    });
  }

  private pushHud(force = false): void {
    const now = this.time.now;
    if (!force && now - this.lastHudPush < HUD_THROTTLE_MS) return;
    this.lastHudPush = now;

    const weapon = this.weaponHud();
    const snapshot: HudSnapshot = {
      score: this.score,
      highScore: this.highScore,
      hp: this.player.hp,
      maxHp: this.player.maxHp,
      shield: this.player.hasShield,
      powerTimeLeft: this.player.powerTimeLeft,
      rapidTimeLeft: this.player.rapidTimeLeft,
      bossHpRatio: this.boss && this.boss.active ? this.boss.hpRatio : null,
      difficulty: this.difficulty,
      wave: this.difficultySys.currentLevel + 1,
      weaponName: weapon.name,
      weaponLevel: weapon.level,
      weaponMax: weapon.max,
      weaponProgress: weapon.progress,
      weaponColor: weapon.color,
    };
    bus.emit(EVENTS.HUD_UPDATE, snapshot);
  }

  update(_time: number, delta: number): void {
    this.effects.updateParallax(delta);
    if (this.gameEnded) {
      this.pushHud();
      return;
    }

    const input = this.readInput();
    this.player.handleMovement(input);
    if (input.fire) this.player.tryFire(this.firePlayerBullet);

    this.difficultySys.update(this.time.now, this.score);
    this.spawner.update(this.time.now);

    if (!this.bossActive && this.score >= this.nextBossScore) {
      this.spawnBoss();
    }

    this.pushHud();
  }
}
