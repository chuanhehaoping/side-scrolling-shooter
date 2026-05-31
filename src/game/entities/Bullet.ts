import * as Phaser from "phaser";

/**
 * A pooled bullet. Used for both player and enemy bullets via separate groups.
 * Bullets carry a `damage` value and auto-deactivate when leaving the world.
 *
 * Player lasers may also pierce: a piercing bullet survives an enemy hit until
 * `pierceLeft` is exhausted. `hitIds` prevents the same target from being
 * damaged repeatedly across the frames it overlaps the bullet.
 */
export class Bullet extends Phaser.Physics.Arcade.Sprite {
  damage = 1;
  pierceLeft = 0;
  readonly hitIds = new Set<number>();

  constructor(scene: Phaser.Scene, texture: string) {
    super(scene, 0, 0, texture);
  }

  fire(
    x: number,
    y: number,
    velocityX: number,
    velocityY: number,
    damage: number,
    angleRad = 0,
    pierce = 0,
  ): void {
    this.enableBody(true, x, y, true, true);
    this.setActive(true);
    this.setVisible(true);
    this.damage = damage;
    this.pierceLeft = pierce;
    this.hitIds.clear();
    this.setRotation(angleRad);
    const body = this.body as Phaser.Physics.Arcade.Body;
    // Match the body to the current texture (textures vary between weapons).
    body.setSize(this.width, this.height);
    body.setVelocity(velocityX, velocityY);
    body.setAllowGravity(false);
  }

  /**
   * Registers a hit against a target. Returns true if the bullet should be
   * removed (non-piercing, or pierce budget exhausted). Returns false when the
   * target was already hit by this bullet (no extra damage should apply).
   */
  registerHit(targetId: number): boolean {
    if (this.hitIds.has(targetId)) return false;
    this.hitIds.add(targetId);
    if (this.pierceLeft > 0) {
      this.pierceLeft -= 1;
      return false;
    }
    return true;
  }

  /** True if this hit is a fresh target (used to decide whether to apply damage). */
  canDamage(targetId: number): boolean {
    return !this.hitIds.has(targetId);
  }

  deactivate(): void {
    this.disableBody(true, true);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    const margin = 40;
    if (
      this.x < -margin ||
      this.x > this.scene.scale.width + margin ||
      this.y < -margin ||
      this.y > this.scene.scale.height + margin
    ) {
      this.deactivate();
    }
  }
}
