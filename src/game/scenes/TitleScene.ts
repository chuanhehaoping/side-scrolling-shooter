import * as Phaser from "phaser";
import { EVENTS, SCENE_KEYS } from "../constants";
import { bus } from "../eventBus";
import { EffectsSystem } from "../systems/EffectsSystem";
import type { Difficulty } from "../types";
import { audio } from "../audio";

/**
 * Animated backdrop for the title screen. The interactive menu (buttons,
 * difficulty, high score) is rendered by the React overlay; this scene just
 * provides the living parallax starfield and a drifting demo ship.
 */
export class TitleScene extends Phaser.Scene {
  private effects!: EffectsSystem;
  private demoShip?: Phaser.GameObjects.Sprite;
  private onStart = (difficulty: Difficulty) => {
    audio.init();
    this.scene.start(SCENE_KEYS.GAME, { difficulty });
  };

  constructor() {
    super(SCENE_KEYS.TITLE);
  }

  create(): void {
    this.effects = new EffectsSystem(this);
    this.effects.createParallax();

    this.demoShip = this.add.sprite(-60, this.scale.height / 2, "player");
    this.tweens.add({
      targets: this.demoShip,
      x: this.scale.width + 80,
      duration: 6000,
      repeat: -1,
      onRepeat: () => {
        if (this.demoShip) {
          this.demoShip.y = Phaser.Math.Between(120, this.scale.height - 120);
        }
      },
    });

    bus.emit(EVENTS.SCENE_STATE, "title");
    bus.on(EVENTS.REQUEST_RESTART, this.onStartDefault, this);
    bus.on("start-game", this.onStart, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      bus.off("start-game", this.onStart, this);
      bus.off(EVENTS.REQUEST_RESTART, this.onStartDefault, this);
    });
  }

  private onStartDefault = () => this.onStart("normal");

  update(_time: number, delta: number): void {
    this.effects.updateParallax(delta);
    if (this.demoShip) {
      this.demoShip.y += Math.sin(this.time.now * 0.003) * 0.3;
    }
  }
}
