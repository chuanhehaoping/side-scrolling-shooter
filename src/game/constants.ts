/**
 * Global, immutable game constants for Sky Strike.
 * Tunable balance values that do not depend on runtime state live here.
 */

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

export const SCENE_KEYS = {
  BOOT: "BootScene",
  TITLE: "TitleScene",
  GAME: "GameScene",
  GAME_OVER: "GameOverScene",
} as const;

export const EVENTS = {
  /** Emitted from GameScene to React HUD with the latest snapshot. */
  HUD_UPDATE: "hud-update",
  /** Emitted from React to GameScene for mobile / external controls. */
  INPUT_STATE: "input-state",
  /** React requests pause toggle. */
  TOGGLE_PAUSE: "toggle-pause",
  /** React requests an immediate restart. */
  REQUEST_RESTART: "request-restart",
  /** React requests returning to the title screen. */
  REQUEST_TITLE: "request-title",
  /** Sound toggle changed from React. */
  SET_MUTED: "set-muted",
  /** GameScene reports game over to React. */
  GAME_OVER: "scene-game-over",
  /** Scene lifecycle change so React can show/hide overlays. */
  SCENE_STATE: "scene-state",
} as const;

export const STORAGE_KEYS = {
  HIGH_SCORE: "sky-strike:high-score",
  MUTED: "sky-strike:muted",
  DIFFICULTY: "sky-strike:difficulty",
} as const;

export const DEPTH = {
  BG_FAR: 0,
  BG_MID: 1,
  BG_NEAR: 2,
  ITEMS: 5,
  ENEMY_BULLETS: 6,
  ENEMIES: 7,
  PLAYER_BULLETS: 8,
  PLAYER: 9,
  BOSS: 10,
  EFFECTS: 12,
} as const;

export const COLORS = {
  player: 0x5ef2ff,
  playerAccent: 0x1b6fb5,
  playerBullet: 0xfff27a,
  enemyBullet: 0xff5b6e,
  enemyA: 0xff7b54,
  enemyB: 0x9d6bff,
  enemyC: 0x4ee08a,
  enemyD: 0xff4fd8,
  boss: 0xc0392b,
  bossAccent: 0xffce54,
  shield: 0x5ef2ff,
  itemHeal: 0x4ee08a,
  itemScore: 0xffce54,
  itemRapid: 0x5ef2ff,
  itemPower: 0xff4fd8,
  itemShield: 0x9d6bff,
} as const;
