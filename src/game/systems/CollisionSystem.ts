import * as Phaser from "phaser";
import type { Player } from "../entities/Player";
import type { Enemy } from "../entities/Enemy";
import type { Boss } from "../entities/Boss";
import { Bullet } from "../entities/Bullet";
import type { Item } from "../entities/Item";

type Group = Phaser.Physics.Arcade.Group;
/** The concrete object type Arcade hands to an overlap callback. */
type OverlapObj = Phaser.GameObjects.GameObject;

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
 *
 * IMPORTANT: Phaser does NOT guarantee callback argument order matches the
 * order passed to overlap(). For sprite-vs-group overlaps it always invokes
 * (sprite, groupChild). So we never assume positions — we identify each object
 * by type and route accordingly. This is what previously crashed the boss
 * fight (`bullet.canDamage is not a function` was called on the boss sprite).
 */
export class CollisionSystem {
  private scene: Phaser.Scene;
  private handlers: CollisionHandlers;

  constructor(scene: Phaser.Scene, handlers: CollisionHandlers) {
    this.scene = scene;
    this.handlers = handlers;
  }

  /** Returns the Bullet from an overlapping pair, regardless of arg order. */
  private static bulletOf(a: unknown, b: unknown): Bullet | null {
    if (a instanceof Bullet) return a;
    if (b instanceof Bullet) return b;
    return null;
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
      const bullet = CollisionSystem.bulletOf(a, b);
      const enemy = (a instanceof Bullet ? b : a) as unknown as Enemy;
      if (bullet) this.handlers.onBulletHitEnemy(bullet, enemy);
    });

    physics.add.overlap(enemyBullets, player, (a, b) => {
      const bullet = CollisionSystem.bulletOf(a, b);
      if (bullet) this.handlers.onPlayerHitByBullet(bullet);
    });

    physics.add.overlap(enemies, player, (a, b) => {
      const playerGo = player as unknown as OverlapObj;
      const enemy = (a === playerGo ? b : a) as unknown as Enemy;
      this.handlers.onPlayerHitByEnemy(enemy);
    });

    physics.add.overlap(items, player, (a, b) => {
      const playerGo = player as unknown as OverlapObj;
      const item = (a === playerGo ? b : a) as unknown as Item;
      this.handlers.onItemCollected(item);
    });
  }

  /** Boss is registered separately because it spawns/despawns mid-run. */
  registerBoss(opts: { player: Player; playerBullets: Group; boss: Boss }): void {
    const { player, playerBullets, boss } = opts;

    this.scene.physics.add.overlap(playerBullets, boss, (a, b) => {
      const bullet = CollisionSystem.bulletOf(a, b);
      if (bullet) this.handlers.onBulletHitBoss(bullet, boss);
    });

    this.scene.physics.add.overlap(player, boss, () => {
      this.handlers.onPlayerHitByBoss(boss);
    });
  }
}
