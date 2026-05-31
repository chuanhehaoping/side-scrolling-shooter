import * as Phaser from "phaser";
import { EVENTS, SCENE_KEYS } from "../constants";
import { bus } from "../eventBus";
import { EffectsSystem } from "../systems/EffectsSystem";
import type { Difficulty, GameOverPayload } from "../types";

/**
 * Provides the animated backdrop after a run ends and bridges restart / title
 * requests from the React overlay back into the scene graph.
 */
export class GameOverScene extends Phaser.Scene {
  private effects!: EffectsSystem;
  private difficulty: Difficulty = "normal";

  constructor() {
    super(SCENE_KEYS.GAME_OVER);
  }

  create(data: GameOverPayload): void {
    this.difficulty = data.difficulty ?? "normal";

    this.effects = new EffectsSystem(this);
    this.effects.createParallax();

    bus.emit(EVENTS.GAME_OVER, data);
    bus.emit(EVENTS.SCENE_STATE, "gameover");

    bus.on(EVENTS.REQUEST_RESTART, this.onRestart, this);
    bus.on(EVENTS.REQUEST_TITLE, this.onTitle, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      bus.off(EVENTS.REQUEST_RESTART, this.onRestart, this);
      bus.off(EVENTS.REQUEST_TITLE, this.onTitle, this);
    });
  }

  private onRestart = () => {
    this.scene.start(SCENE_KEYS.GAME, { difficulty: this.difficulty });
  };

  private onTitle = () => {
    this.scene.start(SCENE_KEYS.TITLE);
  };

  update(_time: number, delta: number): void {
    this.effects.updateParallax(delta);
  }
}
