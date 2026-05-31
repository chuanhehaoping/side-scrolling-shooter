import * as Phaser from "phaser";
import { ITEM } from "../config";
import type { ItemType } from "../types";

const TEXTURE: Record<ItemType, string> = {
  heal: "item-heal",
  score: "item-score",
  rapid: "item-rapid",
  power: "item-power",
  shield: "item-shield",
};

/**
 * Drop item. Drifts left while bobbing gently. Picked up on player overlap.
 */
export class Item extends Phaser.Physics.Arcade.Sprite {
  itemType: ItemType = "score";
  private baseY = 0;
  private spawnTime = 0;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, "item-score");
  }

  spawn(type: ItemType, x: number, y: number): void {
    this.itemType = type;
    this.setTexture(TEXTURE[type]);
    this.enableBody(true, x, y, true, true);
    this.setActive(true);
    this.setVisible(true);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setVelocity(-ITEM.driftSpeed, 0);
    this.baseY = y;
    this.spawnTime = this.scene.time.now;
  }

  deactivate(): void {
    this.disableBody(true, true);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    this.y = this.baseY + Math.sin((time - this.spawnTime) * 0.005) * 12;
    this.setRotation(Math.sin(time * 0.004) * 0.3);
    if (this.x < -40) {
      this.deactivate();
    }
  }
}
