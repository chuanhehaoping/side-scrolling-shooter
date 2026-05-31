import * as Phaser from "phaser";

/**
 * A pooled bullet. Used for both player and enemy bullets via separate groups.
 * Bullets carry a `damage` value and auto-deactivate when leaving the world.
 */
export class Bullet extends Phaser.Physics.Arcade.Sprite {
  damage = 1;

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
  ): void {
    this.enableBody(true, x, y, true, true);
    this.setActive(true);
    this.setVisible(true);
    this.damage = damage;
    this.setRotation(angleRad);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(velocityX, velocityY);
    body.setAllowGravity(false);
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
