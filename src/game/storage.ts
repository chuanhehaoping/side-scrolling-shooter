/**
 * Safe localStorage helpers. All access is guarded so the game never crashes
 * in environments where storage is unavailable (SSR, privacy mode, etc.).
 */
import { STORAGE_KEYS } from "./constants";
import type { Difficulty } from "./types";

function canUseStorage(): boolean {
  try {
    if (typeof window === "undefined" || !window.localStorage) return false;
    const probe = "__sky_strike_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export function getHighScore(): number {
  if (!canUseStorage()) return 0;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
    const value = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

/** Persists the score only if it beats the stored high score. Returns the new high score. */
export function saveHighScore(score: number): number {
  const current = getHighScore();
  if (score <= current) return current;
  if (!canUseStorage()) return score;
  try {
    window.localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, String(score));
  } catch {
    /* ignore */
  }
  return score;
}

export function getMuted(): boolean {
  if (!canUseStorage()) return false;
  try {
    return window.localStorage.getItem(STORAGE_KEYS.MUTED) === "1";
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.MUTED, muted ? "1" : "0");
  } catch {
    /* ignore */
  }
}

const VALID_DIFFICULTIES: Difficulty[] = ["easy", "normal", "hard"];

export function getDifficulty(): Difficulty {
  if (!canUseStorage()) return "normal";
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.DIFFICULTY);
    return raw && (VALID_DIFFICULTIES as string[]).includes(raw)
      ? (raw as Difficulty)
      : "normal";
  } catch {
    return "normal";
  }
}

export function setDifficulty(difficulty: Difficulty): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.DIFFICULTY, difficulty);
  } catch {
    /* ignore */
  }
}
