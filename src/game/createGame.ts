import * as Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "./constants";
import { BootScene } from "./scenes/BootScene";
import { TitleScene } from "./scenes/TitleScene";
import { GameScene } from "./scenes/GameScene";
import { GameOverScene } from "./scenes/GameOverScene";

/**
 * Creates the Phaser game instance attached to the given parent element.
 * Must only be called on the client (no window access happens before this).
 */
export function createGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: "#04060f",
    pixelArt: false,
    roundPixels: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
    },
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    fps: {
      target: 60,
      min: 30,
    },
    scene: [BootScene, TitleScene, GameScene, GameOverScene],
  });
}
