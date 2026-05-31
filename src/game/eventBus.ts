import * as Phaser from "phaser";

/**
 * Shared event bus connecting the React UI layer and the Phaser scenes.
 * A module-level singleton is safe here because the game is entirely
 * client-side; both sides import the same instance.
 *
 * IMPORTANT: every listener added must be removed on cleanup (React effect
 * teardown / scene shutdown) to avoid duplicate handlers across restarts.
 */
export const bus = new Phaser.Events.EventEmitter();
