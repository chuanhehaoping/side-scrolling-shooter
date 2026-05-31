import * as Phaser from "phaser";
import type { Player } from "../entities/Player";
import type { Enemy } from "../entities/Enemy";
import type { Boss } from "../entities/Boss";
import type { Bullet } from "../entities/Bullet";
import type { Item } from "../entities/Item";

type Group = Phaser.Physics.Arcade.Group;

interface CollisionHandlers {
  onBulletHitEnemy: (bullet: Bullet, enemy: Enemy) => void;
  onBulletHitBoss: (bullet: Bullet, boss: Boss) => void;
  onPlayerHitByBullet: (bullet: Bullet) => void;
  onPlayerHitByEnemy: (enemy: Enemy) => void;
  onPlayerHitByBoss: (boss: Boss) => void;
  onItemCollected: (item: Item) => void;
}

/**
 * Centralises all Arcade overlap registration. Overlaps are added once per
 * scene start; the active flag on bodies guarantees pooled/dead objects are
 * skipped automatically by Phaser.
 */
export class CollisionSystem {
  private scene: Phaser.Scene;
  private handlers: CollisionHandlers;

  constructor(scene: Phaser.Scene, handlers: CollisionHandlers) {
    this.scene = scene;
    this.handlers = handlers;
  }

  register(opts: {
    player: Player;
    playerBullets: Group;
    enemyBullets: Group;
    enemies: Group;
    items: Group;
  }): void {
    const { player, playerBullets, enemyBullets, enemies, items } = opts;
    const physics = this.scene.physics;

    physics.add.overlap(playerBullets, enemies, (a, b) => {
      this.handlers.onBulletHitEnemy(a as Bullet, b as Enemy);
    });

    physics.add.overlap(enemyBullets, player, (_p, b) => {
      this.handlers.onPlayerHitByBullet(b as Bullet);
    });

    physics.add.overlap(enemies, player, (_p, e) => {
      this.handlers.onPlayerHitByEnemy(e as Enemy);
    });

    physics.add.overlap(items, player, (_p, i) => {
      this.handlers.onItemCollected(i as Item);
    });
  }

  /** Boss is registered separately because it spawns/despawns mid-run. */
  registerBoss(opts: { player: Player; playerBullets: Group; boss: Boss }): void {
    const { playerBullets, boss } = opts;
    this.scene.physics.add.overlap(playerBullets, boss, (a, b) => {
      this.handlers.onBulletHitBoss(a as Bullet, b as Boss);
    });
    this.scene.physics.add.overlap(opts.player, boss, (_p, bs) => {
      this.handlers.onPlayerHitByBoss(bs as Boss);
    });
  }
}
